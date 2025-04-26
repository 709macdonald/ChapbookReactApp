import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  base: command === "build" ? "/ChapbookReactApp/" : "/",
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      global: resolve(__dirname, "src/global-shim.js"),
    },
  },
  build: {
    outDir: "dist",
    copyPublicDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5005", // ONLY for local dev!
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
