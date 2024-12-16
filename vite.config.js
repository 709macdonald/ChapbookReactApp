import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync } from "fs";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: "copy-pdf-worker",
      writeBundle() {
        try {
          const workerPath = resolve(
            __dirname,
            "node_modules/pdfjs-dist/build/pdf.worker.mjs"
          );
          const publicPath = resolve(__dirname, "public/pdf.worker.mjs");
          copyFileSync(workerPath, publicPath);
        } catch (error) {
          console.error("Error copying worker file:", error);
        }
      },
    },
  ],
  base: command === "build" ? "/ChapbookReactApp/" : "/",
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      global: resolve(__dirname, "src/global-shim.js"),
    },
  },
}));
