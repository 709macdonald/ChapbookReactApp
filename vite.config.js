import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/", 
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
        target: "http://localhost:5005",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
