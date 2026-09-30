import { resolve } from "node:path";
import {
  comparePublicSurfaces,
  publicSurfaceMarkdown,
  type RpcManifest,
} from "./manifest-compatibility.js";
import { readJson, writeAtomic } from "./shared.js";

async function main(): Promise<void> {
  const [baseArgument, headArgument, jsonArgument, markdownArgument] =
    process.argv.slice(2);
  if (!baseArgument || !headArgument || !jsonArgument || !markdownArgument) {
    throw new Error(
      "Usage: compare-manifest BASE HEAD OUTPUT.json OUTPUT.md",
    );
  }

  const [base, head] = await Promise.all([
    readJson<RpcManifest>(resolve(baseArgument)),
    readJson<RpcManifest>(resolve(headArgument)),
  ]);
  const comparison = comparePublicSurfaces(base, head);
  await Promise.all([
    writeAtomic(
      resolve(jsonArgument),
      `${JSON.stringify(comparison, null, 2)}\n`,
    ),
    writeAtomic(resolve(markdownArgument), publicSurfaceMarkdown(comparison)),
  ]);
  console.log(
    comparison.breaking
      ? "Breaking RPC public-surface changes detected"
      : "RPC public surface is backward-compatible",
  );
}

await main();
