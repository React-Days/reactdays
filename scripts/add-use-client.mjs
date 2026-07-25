// Prepend the "use client" directive to the client-entry bundles.
// esbuild strips module-level directives when bundling, so we re-add it here so
// React Server Component bundlers treat @reactdays/react/client as client-only.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const targets = ["client.js", "client.cjs"];
const directive = '"use client";\n';

for (const file of targets) {
  const path = join(dist, file);
  const source = await readFile(path, "utf8");
  if (source.startsWith('"use client"') || source.startsWith("'use client'")) {
    continue;
  }
  await writeFile(path, directive + source, "utf8");
  console.log(`add-use-client: prepended directive to dist/${file}`);
}
