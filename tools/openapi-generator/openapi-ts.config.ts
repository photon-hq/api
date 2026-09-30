import { defineConfig } from "@hey-api/openapi-ts";
import { prepareInput, typeResolvers, zodResolvers } from "./zod-resolvers.ts";

/**
 * Operation-derived names keep the operationId's spelling with its first
 * letter capitalized (`createM2MToken` -> `CreateM2MTokenData`,
 * `zCreateM2MTokenBody`), the names the RPC facade and the other languages
 * use. Hey API's default casing rewrites a digit's capital run
 * (`CreateM2mTokenData`), so the facade would not compile.
 */
const upperFirst = (value: string): string => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
const operationName = (template: string) => (operationId: string): string =>
  template.replace("{{Name}}", upperFirst(operationId)).replace("{{name}}", operationId);
const preserved = (template: string) => ({ case: "preserve" as const, name: operationName(template) });

export default defineConfig({
  input: "../../openapi/sdk.json",
  // readOnly/writeOnly are annotations in OpenAPI 3.1; the contract names
  // request and response shapes separately. Without this, Hey API derived
  // `<Component>Writable` request variants that drop readOnly properties.
  parser: {
    transforms: { readWrite: false },
    // Validation-only keywords are left to the service; defaults are
    // documented, never filled in (zod-resolvers.ts).
    patch: { input: prepareInput },
  },
  output: {
    path: "../../packages/typescript/src/generated",
    importFileExtension: ".js",
    tsConfigPath: "../../packages/typescript/tsconfig.json",
    // Only the operation ID casing reads this: keep `createM2MToken` rather
    // than camel-casing it to `createM2mToken` before any name is built.
    case: "preserve",
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
    },
    {
      name: "@hey-api/typescript",
      $resolvers: typeResolvers,
      // Component types keep the contract's exact spelling (the default
      // PascalCase would turn `OAuth` into `Oauth` and `M2M` into `M2m`).
      definitions: {
        case: "preserve",
      },
      // Enum types are unions of their values (open: see zod-resolvers.ts), not
      // JavaScript objects, whose derived types would be closed.
      enums: false,
      requests: preserved("{{Name}}Data"),
      errors: { ...preserved("{{Name}}Errors"), error: operationName("{{Name}}Error") },
      // Hey API's per-operation union of success bodies defaults to
      // `{{name}}Response`, which collides with contract components of that
      // name (Hey API then appends `2`). Contract names win; the facade
      // validates each status against its own component instead.
      responses: {
        ...preserved("{{Name}}Responses"),
        response: operationName("{{Name}}Result"),
      },
    },
    {
      name: "zod",
      $resolvers: zodResolvers,
      compatibilityVersion: 4,
      definitions: {
        // Validators are exactly `z<ComponentName>`, and their inferred types
        // `<ComponentName>ZodInput`/`ZodOutput` (camelCase would turn `M2M`
        // into `m2m`).
        case: "preserve",
        types: {
          input: { case: "preserve" },
          output: { case: "preserve" },
        },
      },
      requests: {
        body: preserved("z{{Name}}Body"),
        headers: preserved("z{{Name}}Headers"),
        path: preserved("z{{Name}}Path"),
        query: preserved("z{{Name}}Query"),
        types: {
          input: true,
        },
      },
      responses: {
        // Same collision as the TypeScript plugin's `{{name}}Response`.
        ...preserved("z{{Name}}Result"),
        types: {
          output: preserved("{{name}}ResultZodOutput"),
        },
      },
    },
    {
      name: "@hey-api/sdk",
      auth: false,
      client: false,
      operations: {
        methodName: { casing: "preserve" },
      },
      paramsStructure: "grouped",
      responseStyle: "fields",
      // Requests are checked by the types only; the service validates them.
      validator: {
        request: false,
        response: "zod",
      },
    },
  ],
});
