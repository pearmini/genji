import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./__tests__/markdown",
  publicDir: path.resolve("./__test__"),
  resolve: {
    alias: [
      { find: "genji-notebook", replacement: path.resolve("./src/index.js") },
    ],
  },
  build: {
    lib: {
      entry: path.resolve("./src/index.js"),
      name: "genji-renderer",
      fileName: "genji-renderer",
    },
    rollupOptions: {
      output: {
        dir: path.resolve("./dist"),
        assetFileNames: "genji-renderer.css",
      },
    },
  },
  server: {
    port: 8008,
    open: "/",
  },
});
