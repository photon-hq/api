import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const changingMethods = new Set([
  'brand', 'catch', 'codec', 'coerce', 'decode', 'default', 'encode', 'pipe', 'prefault',
  'preprocess', 'readonly', 'transform',
]);

// Only audited Zod construction methods may be dropped with an unused schema.
// Keep unfamiliar calls (especially registry writes and custom factories) intact.
const schemaMethods = new Set([
  'and', 'array', 'boolean', 'catchall', 'date', 'datetime', 'default', 'discriminatedUnion',
  'email', 'enum', 'gt', 'gte', 'instanceof', 'int', 'ipv4', 'lazy', 'length', 'literal',
  'looseObject', 'lte', 'max', 'min', 'never', 'null', 'nullable', 'nullish',
  'number', 'object', 'optional', 'readonly', 'record', 'regex', 'strictObject',
  'string', 'tuple', 'union', 'unknown', 'url', 'void',
]);

// Audited SDK helpers (packages/typescript/src/validation.ts) that only build a
// schema from their arguments. They count only when imported from that module.
const schemaHelpers = new Set(['absent', 'narrowed', 'openEnum', 'openNumberEnum', 'unknownMember']);

/** Let bundlers discard whole unused schema initializers, including their children. */
export function markPureSchemas(source) {
  const ast = ts.createSourceFile('schemas.ts', source, ts.ScriptTarget.Latest, true);
  const helpers = new Set(ast.statements.filter((statement) => ts.isImportDeclaration(statement) &&
    ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text === '../validation.js' &&
    !statement.importClause?.isTypeOnly && statement.importClause?.namedBindings &&
    ts.isNamedImports(statement.importClause.namedBindings))
    .flatMap((statement) => [...statement.importClause.namedBindings.elements])
    .filter((element) => !element.isTypeOnly && schemaHelpers.has((element.propertyName ?? element.name).text))
    .map((element) => element.name.text));
  const declarations = ast.statements.filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations]);
  const definitions = new Map(declarations.filter((item) => ts.isIdentifier(item.name)).map((item) => [item.name.text, item.initializer]));
  const checking = new Set();
  const reviewed = new WeakMap();
  const namedSchema = (name) => {
    const init = definitions.get(name);
    if (!init || checking.has(name)) return false;
    checking.add(name);
    const result = ts.isCallExpression(init) && safe(init);
    checking.delete(name);
    return result;
  };
  const receiver = (node) =>
    (ts.isIdentifier(node) && (node.text === 'z' || namedSchema(node.text))) ||
    (ts.isPropertyAccessExpression(node) && (ts.isIdentifier(node.expression) &&
      ((node.expression.text === 'GeneratedZod' && node.name.text.startsWith('z')) ||
       (node.expression.text === 'z' && node.name.text === 'iso')))) ||
    (ts.isCallExpression(node) && safe(node));
  const safe = (node) => {
    if (reviewed.has(node)) return reviewed.get(node);
    const result = review(node);
    reviewed.set(node, result);
    return result;
  };
  const review = (node) => {
    // The resolver emits the built-in Blob constructor. Arbitrary constructors
    // can expose observable getters during z.instanceof() construction.
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'instanceof' &&
      !(node.arguments.length === 1 && ts.isIdentifier(node.arguments[0]) &&
        node.arguments[0].text === 'Blob')) return false;
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && helpers.has(node.expression.text)) {
      return !node.typeArguments && node.arguments.every((argument) => safe(argument));
    }
    if (ts.isCallExpression(node) && !(ts.isPropertyAccessExpression(node.expression) &&
      schemaMethods.has(node.expression.name.text) && receiver(node.expression.expression))) return false;
    if (ts.isNewExpression(node) || ts.isSpreadAssignment(node) || ts.isSpreadElement(node) ||
      ts.isGetAccessor(node) || ts.isSetAccessor(node) || ts.isBinaryExpression(node) ||
      ts.isPostfixUnaryExpression(node) || ts.isAwaitExpression(node) || ts.isDeleteExpression(node) ||
      ts.isTaggedTemplateExpression(node) || (ts.isPrefixUnaryExpression(node) &&
        [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator))) return false;
    if (ts.isPropertyAccessExpression(node) && !(receiver(node) ||
      (schemaMethods.has(node.name.text) && receiver(node.expression)))) return false;
    return !ts.forEachChild(node, (child) => !safe(child) || undefined);
  };
  for (const declaration of declarations.reverse()) {
    const init = declaration.initializer;
    if (!init || !ts.isCallExpression(init) || !safe(init)) continue;
    // Annotating only the outer Zod call leaves its nested arguments live. The
    // closure lets a bundler remove the entire expression without running it.
    source = source.slice(0, init.getStart(ast)) + '/* @__PURE__ */ (() => ' +
      source.slice(init.getStart(ast), init.end) + ')()' + source.slice(init.end);
  }
  return source;
}

/**
 * Keep public declarations from expanding Zod's entire inferred implementation type.
 * Both generators read the same SDK schema. Only value-preserving unions can use the
 * wire type for BOTH input and output; defaults/transforms (including through refs)
 * retain their original inference. The SDK compiler checks every annotation.
 * AST positions make this independent of generated formatting and comments.
 */
export function boundZodTypes(source, typesSource) {
  const ast = ts.createSourceFile('zod.gen.ts', source, ts.ScriptTarget.Latest, true);
  const types = ts.createSourceFile('types.gen.ts', typesSource, ts.ScriptTarget.Latest, true);
  const exported = (node) => node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  const names = new Set(types.statements.filter((s) =>
    exported(s) && (ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s)),
  ).map((s) => s.name.text));
  const declarations = new Map();
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        declarations.set(declaration.name.text, declaration);
      }
    }
  }
  const preservesValues = (node, visiting = new Set()) => {
    if (ts.isPropertyAccessExpression(node) && changingMethods.has(node.name.text)) return false;
    if (ts.isIdentifier(node) && declarations.has(node.text)) {
      if (visiting.has(node.text)) return true;
      const next = new Set(visiting).add(node.text);
      return preservesValues(declarations.get(node.text).initializer, next);
    }
    return !ts.forEachChild(node, (child) => !preservesValues(child, visiting) || undefined);
  };
  const edits = [];
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement) || !exported(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.type || !declaration.initializer) continue;
      const name = declaration.name.text;
      const model = name.slice(1);
      const init = declaration.initializer;
      if (!name.startsWith('z') || !names.has(model) || !ts.isCallExpression(init) ||
          !ts.isPropertyAccessExpression(init.expression) ||
          !ts.isIdentifier(init.expression.expression) || init.expression.expression.text !== 'z' ||
          init.expression.name.text !== 'union' || !preservesValues(init)) continue;
      const wire = ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(ts.factory.createIdentifier('PhotonWireTypes'), model),
      );
      const annotation = ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(ts.factory.createIdentifier('z'), 'ZodType'), [wire, wire],
      );
      const text = ts.createPrinter().printNode(ts.EmitHint.Unspecified, annotation, ast);
      edits.push({ position: declaration.name.end, text: `: ${text}` });
    }
  }
  if (!edits.length) return { source, count: 0 };
  assert(!/\bPhotonWireTypes\b/.test(source), 'Generated namespace PhotonWireTypes is already in use');
  for (const edit of edits.reverse()) {
    source = source.slice(0, edit.position) + edit.text + source.slice(edit.position);
  }
  return {
    source: `import type * as PhotonWireTypes from './types.gen.js';\n\n${source}`,
    count: edits.length,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const base = new URL('../../packages/typescript/src/generated/', import.meta.url);
  const zodPath = new URL('zod.gen.ts', base);
  const result = boundZodTypes(
    await readFile(zodPath, 'utf8'),
    await readFile(new URL('types.gen.ts', base), 'utf8'),
  );
  await writeFile(zodPath, markPureSchemas(result.source));
  console.log(`Added ${result.count} explicit Zod union type boundaries to ${fileURLToPath(zodPath)}`);
}
