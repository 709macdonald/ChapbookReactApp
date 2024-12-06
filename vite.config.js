import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/ChapbookReactApp/",
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      global: resolve(__dirname, "src/global-shim.js"),
    },
  },
  optimizeDeps: {
    include: ["pdfjs-dist", "pdfjs-dist/build/pdf.worker.mjs"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfWorker: ["pdfjs-dist/build/pdf.worker.mjs"],
        },
      },
    },
  },
});
