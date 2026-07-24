import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// PORT only matters for the dev/preview server. Default it so `vite build`
// works on any host (Vercel/Netlify/Replit/GitHub Pages) with no extra config.
const rawPort = process.env.PORT ?? "5173";
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// BASE_PATH lets you deploy under a sub-path (e.g. GitHub Pages). Defaults to "/".
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    strictPort: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
  },
});
