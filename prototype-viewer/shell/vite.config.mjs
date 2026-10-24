import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  define: { "process.env.NODE_ENV": '"production"' },
  build: {
    outDir: "../assets",
    emptyOutDir: false,
    minify: true,
    lib: {
      entry: fileURLToPath(new URL("./viewer.jsx", import.meta.url)),
      name: "PrototypeViewer",
      formats: ["iife"],
      fileName: () => "viewer.js",
    },
  },
});
