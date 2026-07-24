import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  platform: "node",
  clean: true,
  // Bundle internal workspace packages (they export TypeScript source) so the
  // output has no runtime dependency on uncompiled TS. Third-party deps stay
  // external — pnpm installs them in node_modules.
  noExternal: [/^@workspace\//],
});
