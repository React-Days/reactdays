import { defineConfig } from "tsup";

const shared = {
  format: ["esm", "cjs"] as const,
  dts: true,
  sourcemap: true,
  treeshake: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  target: "es2021" as const,
  outExtension({ format }: { format: "esm" | "cjs" | "iife" }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
};

export default defineConfig([
  {
    ...shared,
    clean: true,
    entry: { index: "src/index.ts" },
  },
  {
    ...shared,
    clean: false, // don't wipe the core build emitted above
    entry: { client: "src/react/index.ts" },
  },
]);

// esbuild strips top-level "use client" directives when bundling, so the
// `scripts/add-use-client.mjs` post-build step re-adds it to the client outputs.
// See the `build` script in package.json.
