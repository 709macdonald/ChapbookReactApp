import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/ChapbookReactApp/" : "/", // Set the base for GitHub Pages
  define: {
    global: "window", // Compatibility for libraries using `global`
  },
  resolve: {
    alias: {
      global: resolve(__dirname, "src/global-shim.js"), // Alias for your global shim
    },
  },
  build: {
    outDir: "dist", // Output directory for builds
    copyPublicDir: true, // Ensures public directory content is included in builds
  },
}));
