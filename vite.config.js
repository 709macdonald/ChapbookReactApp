import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command }) => ({
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
      "/api": "http://localhost:5005", // Proxy API calls to your backend running on port 5005
    },
  },
}));
