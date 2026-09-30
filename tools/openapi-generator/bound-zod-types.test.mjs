import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { boundZodTypes, markPureSchemas } from './bound-zod-types.mjs';

const types = 'export type Message = { kind: "sms"; text: string } | { kind: "email"; subject: string };';

test('unused schema trees disappear while validation and unfamiliar side effects remain', async () => {
  const { build } = await import('esbuild');
  const source = `import { z } from 'zod';
export const unused = z.strictObject({ sentinelUnused: z.string().min(8) });
export const unusedCatchall = z.object({ sentinelCatchall: z.string() }).catchall(z.number());
export const unusedBinary = z.instanceof(Blob);
export const used = z.strictObject({ count: z.number().int().gte(0) });
console.log(used.safeParse({ count: 3 }).success, used.safeParse({ count: -1 }).success);`;
  const optimized = markPureSchemas(source);
  assert.equal(markPureSchemas(optimized), optimized);
  const { outputFiles } = await build({ stdin: { contents: optimized.replaceAll('export const', 'const'), resolveDir: process.cwd(), loader: 'ts' }, bundle: true, write: false, minify: true, platform: 'node', format: 'esm' });
  assert.ok(!outputFiles[0].text.includes('sentinelUnused'));
  assert.ok(!outputFiles[0].text.includes('sentinelCatchall'));
  assert.ok(!outputFiles[0].text.includes('instanceof(Blob)'));
  const { execFileSync } = await import('node:child_process');
  // Bundled code can exceed Linux's per-argument size limit. Feed it over stdin.
  assert.equal(execFileSync(process.execPath, ['--input-type=module'], {
    input: outputFiles[0].text, encoding: 'utf8',
  }).trim(), 'true false');
  for (const expression of [
    'customFactory()', 'z.string().register(registry)', 'z.string().transform(customFactory())',
    'z.instanceof(customConstructor)',
    'z.string().default(external.value)', 'z.string().min(++counter)', 'external.string()',
  ]) {
    const original = `const external = customFactory(); export const schema = ${expression};`;
    assert.equal(markPureSchemas(original), original);
  }
});

test('schemas built with the SDK schema helpers stay removable', () => {
  const source = `import { narrowed, openEnum, unknownMember } from '../validation.js';
import * as z from 'zod';
export const zKind = openEnum(['sms', 'email']);
export const zUser = z.union([z.object({ platform: zKind }), unknownMember('platform', z.object({ platform: z.string() }))]);
export const zPlatformUser = narrowed(zUser, z.object({ platform: zKind }));`;
  const optimized = markPureSchemas(source);
  assert.equal(optimized.match(/@__PURE__/g)?.length, 3);
  assert.equal(markPureSchemas(optimized), optimized);
  for (const original of [
    "import { openEnum } from './other.js'; export const zKind = openEnum(['sms']);",
    "import { openEnum } from '../validation.js'; export const zKind = openEnum([customFactory()]);",
    "import { prefixItems } from '../validation.js'; export const check = prefixItems([]);",
  ]) assert.equal(markPureSchemas(original), original);
});

test('annotates an exported union using its named wire type regardless of formatting', () => {
  const source = `import { z } from 'zod';
/** Message documentation. */
export const zMessage /* annotation goes after the name */ = z.union([
  z.object({ kind: z.literal('sms'), text: z.string() }),
  z.object({ kind: z.literal('email'), subject: z.string() }),
]);
export type MessageInput = z.input<typeof zMessage>;
export type MessageOutput = z.output<typeof zMessage>;`;
  const result = boundZodTypes(source, types);
  assert.equal(result.count, 1);
  assert.match(result.source, /zMessage: z\.ZodType<PhotonWireTypes\.Message, PhotonWireTypes\.Message>/);
  assert.ok(result.source.includes('/** Message documentation. */'));
  assert.ok(result.source.includes("z.literal('sms')"));
  assert.deepEqual(boundZodTypes(result.source, types), { source: result.source, count: 0 });
});

test('retains distinct inferred input/output types through defaults and referenced transforms', () => {
  for (const leaf of [
    "z.string().default('sms')",
    'z.string().transform(value => value.length)',
    'z.coerce.number()',
    "z.string().brand('Tag')",
  ]) {
    const source = `const zLeaf = ${leaf};
export const zMessage = z.union([z.object({ value: zLeaf }), z.null()]);`;
    assert.deepEqual(boundZodTypes(source, types), { source, count: 0 });
  }
});

test('does not annotate non-unions, unexported schemas, or schemas without a matching type', () => {
  for (const source of [
    'export const zMessage = z.object({ kind: z.string() });',
    'const zMessage = z.union([z.string(), z.number()]);',
    'export const zMissing = z.union([z.string(), z.number()]);',
  ]) assert.deepEqual(boundZodTypes(source, types), { source, count: 0 });
});

test('emits consumable declarations and preserves validation and default input/output types', async () => {
  const directory = await mkdtemp(fileURLToPath(new URL('.type-test-', import.meta.url)));
  try {
    const original = `import { z } from 'zod';
export const zMessage = z.union([
  z.object({ kind: z.literal('sms'), text: z.string() }),
  z.object({ kind: z.literal('email'), subject: z.string() }),
]);
export const zDefault = z.object({ text: z.string().default('hello') });`;
    const consumer = `import { z } from 'zod';
import { zMessage, zDefault } from './zod.gen.js';
const sms: z.input<typeof zMessage> = { kind: 'sms', text: 'hello' };
// @ts-expect-error an SMS still requires text
const invalid: z.input<typeof zMessage> = { kind: 'sms' };
const defaultInput: z.input<typeof zDefault> = {};
// @ts-expect-error the default is present in the parsed output
const defaultOutput: z.output<typeof zDefault> = {};
export { sms, invalid, defaultInput, defaultOutput };`;
    await Promise.all([
      writeFile(`${directory}/types.gen.ts`, types),
      writeFile(`${directory}/zod.gen.ts`, boundZodTypes(original, types).source),
      writeFile(`${directory}/consumer.ts`, consumer),
    ]);
    const program = ts.createProgram([`${directory}/consumer.ts`], {
      strict: true, declaration: true, skipLibCheck: true,
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    });
    const result = program.emit();
    const errors = [...ts.getPreEmitDiagnostics(program), ...result.diagnostics];
    assert.deepEqual(errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, '\n')), []);
    const declaration = await readFile(`${directory}/zod.gen.d.ts`, 'utf8');
    assert.match(declaration, /zMessage: z\.ZodType<PhotonWireTypes\.Message, PhotonWireTypes\.Message>/);
    const schemas = await import(pathToFileURL(`${directory}/zod.gen.js`).href);
    assert.deepEqual(schemas.zMessage.parse({ kind: 'sms', text: 'hello' }), { kind: 'sms', text: 'hello' });
    assert.equal(schemas.zMessage.safeParse({ kind: 'sms' }).success, false);
    assert.equal(schemas.zMessage.safeParse({ kind: 'other', text: 'hello' }).success, false);
    assert.deepEqual(schemas.zDefault.parse({}), { text: 'hello' });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
