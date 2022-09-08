import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: [
      { find: "genji-renderer", replacement: path.resolve("./src/index.js") },
    ],
  },
  build: {
    lib: {
      entry: path.resolve("./src/index.js"),
      name: "genji-renderer",
      fileName: "genji-renderer",
    },
  },
  server: {
    port: 8008,
    open: "/",
  },
});
