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
}));
