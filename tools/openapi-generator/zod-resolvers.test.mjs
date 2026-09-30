import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { build } from 'esbuild';
import { createClient } from '@hey-api/openapi-ts';
import configured from './openapi-ts.config.ts';

const config = await configured;

const root = fileURLToPath(new URL('../../', import.meta.url));
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const name = { type: 'string', minLength: 1 };
const base = { type: 'object', properties: { name }, required: ['name'] };
const platformExtension = { discriminator: 'platform', fallback: '#/$defs/UnknownMember', reserved: ['sms', 'email'] };
const schemas = {
  Closed: { ...base, additionalProperties: false },
  Open: { ...base, additionalProperties: true },
  ImplicitOpen: base,
  Typed: { ...base, additionalProperties: name },
  Text: name,
  TypedRef: { ...base, additionalProperties: ref('Text') },
  TypedNumber: { ...base, additionalProperties: { type: 'number', minimum: 1 } },
  TypedNullable: { ...base, additionalProperties: { anyOf: [ref('Closed'), { type: 'null' }] } },
  CatchallDefault: { ...base, additionalProperties: { default: 'default' } },
  ObjectDefault: { ...base, additionalProperties: false, default: { name: 'default' } },
  EmptyClosed: { type: 'object', additionalProperties: false },
  EmptyOpen: { type: 'object', additionalProperties: true },
  EmptyImplicit: { type: 'object' },
  Dictionary: { type: 'object', additionalProperties: ref('Closed') },
  Defaults: { type: 'object', additionalProperties: false, properties: {
    label: { type: 'string', default: 'ready' },
    required: { type: 'string' },
    nullable: { type: ['string', 'null'] },
  }, required: ['required', 'nullable'] },
  Nested: { type: 'object', additionalProperties: false, properties: {
    direct: { ...base, additionalProperties: false },
    referenced: ref('Closed'),
    items: { type: 'array', items: ref('Open') },
    map: ref('Dictionary'),
  }, required: ['direct', 'referenced', 'items', 'map'] },
  Recursive: { type: 'object', additionalProperties: false, properties: {
    name, children: { type: 'array', items: ref('Recursive') },
  }, required: ['name'] },
  RecursiveMap: { type: 'object', properties: { name }, required: ['name'],
    additionalProperties: { anyOf: [{ type: 'string' }, ref('RecursiveMap')] } },
  NullableClosed: { anyOf: [ref('Closed'), { type: 'null' }] },
  ClosedEnum: { type: 'string', enum: ['known'] },
  Composed: { allOf: [ref('Open'), { type: 'object', properties: { count: { type: 'integer' } }, required: ['count'] }] },
  Binary: { type: 'string', format: 'binary' },
  BinaryFields: { type: 'object', additionalProperties: false, properties: {
    required: ref('Binary'), optional: ref('Binary'),
    nullable: { anyOf: [ref('Binary'), { type: 'null' }] },
  }, required: ['required', 'nullable'] },
  NormalString: { type: 'string', minLength: 3, maxLength: 5, pattern: '^[a-z]+$' },
  OpenEnum: { type: 'string', enum: ['a', 'b'] },
  NumberEnum: { type: 'integer', enum: [1, 2] },
  Whole: { type: 'integer', minimum: 0, maximum: 10 },
  // Keywords the intermediate schema drops or 0.99.0 ignores.
  Forbidden: { type: 'object', additionalProperties: false, properties: { name, legacy: { not: {} } }, required: ['name'] },
  ForbiddenOpen: { type: 'object', additionalProperties: true, properties: { name, legacy: false }, required: ['name'] },
  Unique: { type: 'array', items: { type: 'object', additionalProperties: true }, uniqueItems: true, maxItems: 3 },
  Counted: { type: 'object', additionalProperties: { type: 'integer' }, minProperties: 1, maxProperties: 2 },
  Named: { type: 'object', propertyNames: { type: 'string', pattern: '^[a-z]+$' }, additionalProperties: { type: 'string' } },
  Marker: { const: 'first', type: 'string' },
  OpenPrefix: { type: 'array', prefixItems: [ref('Marker'), { type: 'integer' }] },
  ClosedTuple: { type: 'array', prefixItems: [{ type: 'number' }, { type: 'number' }], items: false, minItems: 2, maxItems: 2 },
  Instant: { type: 'string', format: 'date-time', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?(?:Z|[+-]\\d{2}:\\d{2})$' },
  Short: { type: 'string', maxLength: 2 },
  Link: { type: 'string', format: 'uri' },
  Moment: { type: 'string', format: 'date-time' },
  StrictUnion: { anyOf: [{ type: 'object', additionalProperties: false, properties: { kind: { const: 'a' }, id: name }, required: ['kind', 'id'] },
    { type: 'object', additionalProperties: false, properties: { kind: { const: 'b' } }, required: ['kind'] }] },
  KindConstraint: { type: 'object', additionalProperties: true, properties: { kind: { enum: ['a'] } }, required: ['kind'] },
  NarrowedUnion: { allOf: [ref('StrictUnion'), ref('KindConstraint')] },
  NarrowedList: { type: 'array', items: { allOf: [ref('StrictUnion'), { type: 'object', additionalProperties: true, properties: { kind: { enum: ['a'] } }, required: ['kind'] }] } },
  // A platform union (User, Message, ...): known members, then the contract's
  // fallback for a platform added later, declared in x-photon-extension.
  SmsMember: { type: 'object', additionalProperties: false, properties: { platform: { const: 'sms', type: 'string' }, handle: name }, required: ['platform', 'handle'] },
  EmailMember: { type: 'object', additionalProperties: false, properties: { platform: { const: 'email', type: 'string' }, address: name }, required: ['platform', 'address'] },
  UnknownMember: { type: 'object', properties: { platform: name, id: name }, required: ['platform', 'id'] },
  Member: { anyOf: [ref('SmsMember'), ref('EmailMember'), ref('UnknownMember')], 'x-photon-extension': platformExtension },
  // A request carries known platforms only.
  MemberInput: { anyOf: [ref('SmsMember'), ref('EmailMember')], 'x-photon-extension': platformExtension },
  MemberHolder: { type: 'object', additionalProperties: false, properties: { member: ref('Member'), members: { type: 'array', items: ref('Member') } }, required: ['member'] },
  PlatformConstraint: { type: 'object', additionalProperties: true, properties: { platform: { enum: ['sms', 'email'] } }, required: ['platform'] },
  PlatformMember: { allOf: [ref('Member'), ref('PlatformConstraint')] },
};
const input = {
  openapi: '3.1.0', info: { title: 'Resolver contracts', version: '1' },
  components: { schemas },
  paths: {
    '/headers/{id}': { post: { operationId: 'checkHeaders', parameters: [
      { name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', minLength: 3, maxLength: 8, pattern: '^[a-z]+$' } },
      { name: 'X-Optional', in: 'header', schema: { type: 'string', minLength: 2 } },
      { name: 'Constructor', in: 'header', schema: { type: 'string', minLength: 1 } },
      { name: 'id', in: 'path', required: true, schema: { type: 'string', minLength: 1 } },
      { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 1 } },
    ], requestBody: { required: true, content: { 'application/json': { schema: ref('Open') } } },
    responses: { 200: { description: 'Object', content: { 'application/json': { schema: ref('Open') } } } } } },
    '/binary': { post: { operationId: 'binary', requestBody: { required: true,
      content: { 'application/octet-stream': { schema: ref('Binary') } } },
    responses: { 200: { description: 'Bytes', content: { 'application/octet-stream': { schema: ref('Binary') } } } } } },
    '/form': { post: { operationId: 'form', requestBody: { required: true,
      content: { 'multipart/form-data': { schema: ref('BinaryFields') } } },
    responses: { 204: { description: 'Accepted' } } } },
  },
};
const { requestBody: _body, ...readOperation } = input.paths['/headers/{id}'].post;
input.paths['/headers/{id}'].get = { ...readOperation, operationId: 'checkReadHeaders' };

let directory;
let generated;
before(async () => {
  directory = await mkdtemp(join(root, 'tools/openapi-generator/.resolver-test-'));
  await copyFile(join(root, 'packages/typescript/src/validation.ts'), join(directory, 'validation.ts'));
  await createClient({ ...config, input,
    output: { ...config.output, path: join(directory, 'generated'), tsConfigPath: null } });
  const entry = `export * from './generated/zod.gen.ts';
export * from './generated/sdk.gen.ts';
export { createClient } from './generated/client/client.gen.ts';`;
  const { outputFiles } = await build({ stdin: { contents: entry, loader: 'ts', resolveDir: directory },
    bundle: true, write: false, platform: 'node', format: 'esm' });
  await writeFile(join(directory, 'bundle.mjs'), outputFiles[0].text);
  generated = await import(pathToFileURL(join(directory, 'bundle.mjs')).href);
});
after(async () => { if (directory) await rm(directory, { recursive: true, force: true }); });

function check(model, value, expected, output = value) {
  const result = generated[`z${model}`].safeParse(value);
  assert.equal(result.success, expected, `${model}: ${JSON.stringify(value)}`);
  if (expected) assert.deepEqual(result.data, output, `${model}: accepted data changed`);
}

const samples = [
  ['valid', { name: 'known' }, ['Closed', 'Open', 'ImplicitOpen', 'Typed', 'TypedRef']],
  ['missing', {}, []], ['wrong type', { name: 42 }, []],
  // Validation-only keywords (minLength here) are left to the service.
  ['empty', { name: '' }, ['Closed', 'Open', 'ImplicitOpen', 'Typed', 'TypedRef']],
  // Members the SDK does not know are kept, even where additionalProperties is false;
  // a typed catchall keeps its type.
  ['string extra', { name: 'known', extra: 'extension' }, ['Closed', 'Open', 'ImplicitOpen', 'Typed', 'TypedRef']],
  ['number extra', { name: 'known', extra: 42 }, ['Closed', 'Open', 'ImplicitOpen']],
  ['null', null, []], ['array', [], []],
];
for (const model of ['Closed', 'Open', 'ImplicitOpen', 'Typed', 'TypedRef']) {
  for (const [label, value, accepted] of samples) {
    test(`${model}: ${label}`, () => check(model, value, accepted.includes(model)));
  }
}
for (const model of ['EmptyClosed', 'EmptyOpen', 'EmptyImplicit']) {
  for (const value of [{}, { extra: { nested: 1 } }, [], null]) {
    test(`${model}: ${JSON.stringify(value)}`, () => check(model, value, value !== null && !Array.isArray(value)));
  }
}
test('typed dictionaries check the type of every extra member', () => {
  check('Dictionary', { a: { name: 'value' } }, true);
  check('Dictionary', { a: { name: 1 } }, false);
  check('Dictionary', { a: { name: 'value', extra: 1 } }, true);
  check('Dictionary', { a: null }, false);
  check('TypedNumber', { name: 'value', extra: 0 }, true);
  check('TypedNumber', { name: 'value', extra: 'invalid' }, false);
  check('TypedNullable', { name: 'value', extra: null }, true);
  check('TypedNullable', { name: 'value', extra: { name: 'child', unknown: true } }, true);
  check('TypedNullable', { name: 'value', extra: { name: 1 } }, false);
});
test('defaults are annotations: nothing is filled in; requiredness and nullability survive', () => {
  check('ObjectDefault', undefined, false);
  check('ObjectDefault', {}, false);
  check('ObjectDefault', { name: 'x' }, true);
  check('CatchallDefault', { name: 'value', extra: 'x' }, true);
  check('Defaults', { required: 'x', nullable: null }, true);
  assert.equal('label' in generated.zDefaults.parse({ required: 'x', nullable: null }), false);
  check('Defaults', { required: 'x', nullable: 'x', label: 'custom' }, true);
  check('Defaults', { nullable: null }, false);
  check('Defaults', { required: 'x' }, false);
  check('Defaults', { required: null, nullable: null }, false);
});
test('nested, referenced and recursive objects keep their types and unknown members', () => {
  const nested = { direct: { name: 'a' }, referenced: { name: 'b' }, items: [{ name: 'c', extension: true }], map: { a: { name: 'd' } } };
  check('Nested', nested, true);
  check('Nested', { ...nested, direct: { name: 'x', extra: 1 } }, true);
  check('Nested', { ...nested, referenced: { name: 1 } }, false);
  check('Recursive', { name: 'a', children: [{ name: 'b', children: [{ name: 'c' }] }] }, true);
  check('Recursive', { name: 'a', children: [{ name: 1 }] }, false);
  check('RecursiveMap', { name: 'a', child: { name: 'b', child: { name: 'c' } } }, true);
  check('RecursiveMap', { name: 'a', child: { name: 1 } }, false);
  check('NullableClosed', null, true);
  check('NullableClosed', { name: 'x', extra: 1 }, true);
  check('Composed', { name: 'x', count: 1, extra: true }, true);
  check('Composed', { name: 'x', count: 'invalid' }, false);
});
test('enums are open; a single value is a constant', () => {
  for (const value of ['a', 'b', 'added-later']) check('OpenEnum', value, true);
  check('OpenEnum', 1, false);
  for (const value of [1, 2, 3]) check('NumberEnum', value, true);
  check('NumberEnum', 'one', false);
  check('ClosedEnum', 'known', true);
  check('ClosedEnum', 'future', false);
  check('NarrowedUnion', { kind: 'a', id: 'x', extra: 1 }, true);
  check('NarrowedUnion', { kind: 'b' }, false);
});
test('validation-only keywords are not enforced', () => {
  for (const value of ['abc', 'ab', 'abcdef', '123']) check('NormalString', value, true);
  check('NormalString', 1, false);
  check('Short', 'abc', true);
  for (const value of ['2024-01-01T10:30Z', 'any text']) check('Instant', value, true);
  for (const value of ['urn:example:thing', 'yesterday']) { check('Link', value, true); check('Moment', value, true); }
  check('Unique', [{ a: 1 }, { a: 1 }, { a: 1 }, { a: 1 }], true);
  check('Counted', {}, true);
  check('Named', { Bad: 'x' }, true);
  check('Named', { good: 1 }, false);
  for (const value of [-1, 11, 2 ** 60]) check('Whole', value, true);
  check('Whole', 1.5, false);
});
test('a property that must be absent (not: {}) is typed never but not checked in a response', async () => {
  check('Forbidden', { name: 'x' }, true);
  // A service that adds the member later (a problem's remediation) does not break the SDK.
  check('Forbidden', { name: 'x', legacy: 'anything' }, true);
  check('ForbiddenOpen', { name: 'x', legacy: 'anything' }, true);
  const types = await readFile(join(directory, 'generated/types.gen.ts'), 'utf8');
  assert.match(types, /export type Forbidden = \{[^}]*legacy\?: never;/);
});
test('open prefixItems allow shorter and longer arrays; closed tuples stay fixed', () => {
  for (const value of [[], ['first'], ['first', 2], ['first', 2, 'anything']]) check('OpenPrefix', value, true);
  for (const value of [['second'], ['first', 'two'], {}]) check('OpenPrefix', value, false);
  check('ClosedTuple', [1, 2], true);
  for (const value of [[1], [1, 2, 3]]) check('ClosedTuple', value, false);
});
test('a platform union reads a platform added later as { platform: "UNKNOWN", raw }', () => {
  const sms = { platform: 'sms', handle: '+1', extra: true };
  check('Member', sms, true);
  check('Member', { platform: 'email', address: 'a@example.com' }, true);
  const later = { platform: 'fax', id: 'u1', handle: 'h', details: { a: 1 } };
  check('Member', later, true, { platform: 'UNKNOWN', raw: later });
  // A known platform the known member does not take is still a contract value.
  check('Member', { platform: 'sms', id: 'u2' }, true, { platform: 'UNKNOWN', raw: { platform: 'sms', id: 'u2' } });
  check('Member', { platform: 'fax' }, false);
  check('MemberHolder', { member: sms, members: [later, sms] }, true,
    { member: sms, members: [{ platform: 'UNKNOWN', raw: later }, sms] });
  check('PlatformMember', sms, true);
  check('PlatformMember', later, true, { platform: 'UNKNOWN', raw: later });
  check('PlatformMember', { platform: 1, id: 'u3' }, false);
  check('MemberInput', sms, true);
  check('MemberInput', later, false);
});
test('binary fields accept Blob/File without changing bytes', async () => {
  for (const value of [new Blob([new Uint8Array([0, 255, 128])]), new File(['text'], 'a.txt')]) {
    check('Binary', value, true);
    assert.equal(generated.zBinary.parse(value), value);
    check('BinaryFields', { required: value, nullable: null }, true);
    check('BinaryFields', { required: value, optional: value, nullable: value }, true);
  }
  for (const value of ['text', new Uint8Array([1]), null, undefined, {}]) check('Binary', value, false);
  check('BinaryFields', { nullable: null }, false);
});
test('generated SDK sends requests as given and checks the response shape', async () => {
  let sent = 0;
  const body = { name: 'x', extension: { retained: true } };
  const client = generated.createClient({ baseUrl: 'https://fixture.invalid', throwOnError: true,
    fetch: async (request) => {
      sent++;
      if (request.method === 'POST') assert.deepEqual(await request.json(), body);
      return Response.json(body);
    } });
  const options = { client, body, path: { id: 'x' }, query: { q: 'yes' } };
  for (const headers of [{ 'Idempotency-Key': 'abc' }, { 'idempotency-key': 'ab' }, {}, { 'X-Extra': 'kept', Constructor: '' }]) {
    const result = await generated.checkHeaders({ ...options, headers });
    assert.deepEqual(result.data, body);
  }
  const { body: _body, ...readOptions } = options;
  assert.deepEqual((await generated.checkReadHeaders({ ...readOptions, headers: new Headers({ 'IDEMPOTENCY-KEY': 'abc' }) })).data, body);
  assert.equal(sent, 5);
  const wrong = generated.createClient({ baseUrl: 'https://fixture.invalid', throwOnError: true,
    fetch: async () => Response.json({ name: 1 }) });
  await assert.rejects(generated.checkReadHeaders({ ...readOptions, client: wrong, headers: {} }));
});
test('generated SDK preserves upload/download bytes and multipart File values', async () => {
  const bytes = new Uint8Array([0, 255, 65, 128]);
  let sent = 0;
  const client = generated.createClient({ baseUrl: 'https://fixture.invalid', throwOnError: true,
    fetch: async (request) => {
      sent++;
      if (new URL(request.url).pathname === '/form') {
        const form = await request.formData();
        assert.deepEqual(new Uint8Array(await form.get('required').arrayBuffer()), bytes);
        return new Response(null, { status: 204 });
      }
      assert.deepEqual(new Uint8Array(await request.arrayBuffer()), bytes);
      return new Response(bytes, { headers: { 'content-type': 'application/octet-stream' } });
    } });
  const body = new Blob([bytes]);
  const response = await generated.binary({ client, body });
  assert.deepEqual(new Uint8Array(await response.data.arrayBuffer()), bytes);
  await generated.form({ client, body: { required: new File([bytes], 'bytes.bin'), nullable: null } });
  assert.equal(sent, 2);
});
test('generated declarations: open enums, optional defaulted members, binary types', async () => {
  const consumer = `import type { z } from 'zod';
import { zDefaults, zBinary, zOpenEnum, zClosedEnum } from './generated/zod.gen.js';
import type { OpenEnum } from './generated/types.gen.js';
const input: z.input<typeof zDefaults> = { required: 'x', nullable: null };
// A default is not filled in, so parsed output may omit the member.
const output: z.output<typeof zDefaults> = { required: 'x', nullable: null };
// @ts-expect-error required field cannot be omitted
const missingRequired: z.input<typeof zDefaults> = { nullable: null };
const bytes: z.input<typeof zBinary> = new Blob();
// @ts-expect-error binary is not a string
const text: z.input<typeof zBinary> = 'text';
const later: z.output<typeof zOpenEnum> = 'added-later';
const laterType: OpenEnum = 'added-later';
// @ts-expect-error an open enum is still a string
const notString: OpenEnum = 1;
// @ts-expect-error a single value is a constant
const future: z.output<typeof zClosedEnum> = 'future';
export { input, output, bytes, later, laterType };
import type { Member, MemberInput } from './generated/types.gen.js';
import { zMember } from './generated/zod.gen.js';
export function describe(member: Member): string {
  if (member.platform === 'sms') return member.handle;
  if (member.platform === 'UNKNOWN') return \`\${member.raw.platform} \${member.raw.id}\`;
  // @ts-expect-error only the SMS member has a handle
  return member.handle;
}
export const parsed: Member = zMember.parse({ platform: 'fax', id: 'u1' });
// @ts-expect-error a platform added later is wrapped, not a Member of its own
export const bare: Member = { platform: 'fax', id: 'u1' };
// @ts-expect-error a request carries known platforms only
export const request: MemberInput = { platform: 'UNKNOWN', raw: { platform: 'fax', id: 'u1' } };`;
  await writeFile(join(directory, 'consumer.ts'), consumer);
  execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'),
    '--ignoreConfig', '--strict', '--skipLibCheck', '--declaration', '--target', 'ES2022',
    '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--outDir', join(directory, 'dist'),
    join(directory, 'consumer.ts'), join(directory, 'generated/sdk.gen.ts')], { stdio: 'pipe' });
  const built = await import(pathToFileURL(join(directory, 'dist/generated/zod.gen.js')).href);
  assert.deepEqual(built.zDefaults.parse({ required: 'x', nullable: null }), { required: 'x', nullable: null });
  const browser = await build({ stdin: { contents: `export { binary, checkHeaders } from './generated/sdk.gen.ts';`,
    loader: 'ts', resolveDir: directory }, bundle: true, write: false, platform: 'browser', format: 'esm' });
  assert.equal(browser.outputFiles.length, 1);
});
test('a default stays documented on the generated type', async () => {
  const { readFile } = await import('node:fs/promises');
  const types = await readFile(join(directory, 'generated/types.gen.ts'), 'utf8');
  assert.match(types, /@default "ready"\s*\*\/\s*label\?: string/);
});
