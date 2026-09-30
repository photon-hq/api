import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

// TypeScript does not remove emitted files when a source module is deleted or
// renamed. Never run stale generator modules or tests from a previous build.
rmSync(new URL("./dist", import.meta.url), { recursive: true, force: true });
execFileSync(process.execPath, [
  fileURLToPath(new URL("../../node_modules/typescript/lib/tsc.js", import.meta.url)),
  "-p", fileURLToPath(new URL("./tsconfig.json", import.meta.url)),
], { stdio: "inherit" });
