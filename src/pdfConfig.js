import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";

if (import.meta.env.PROD) {
  GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
}
