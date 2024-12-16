import * as pdfjsLib from "pdfjs-dist";

// Determine if we're in development or production
const isDevelopment = import.meta.env.DEV;

// Set the worker source based on environment
pdfjsLib.GlobalWorkerOptions.workerSrc = isDevelopment
  ? "/pdf.worker.mjs" // Local development
  : "/ChapbookReactApp/pdf.worker.mjs"; // Production/GitHub Pages

// Rest of your code...

export const PDFTextExtraction = async (fileUrl) => {
  return new Promise((resolve, reject) => {
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    loadingTask.promise
      .then(async (doc) => {
        let allText = "";
        const textLocations = [];

        const minPage = 1;
        const maxPage = doc.numPages;

        try {
          for (let pageNumber = minPage; pageNumber <= maxPage; pageNumber++) {
            const page = await doc.getPage(pageNumber);
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: 1 });

            textContent.items.forEach((item) => {
              const words = item.str
                .split(/\s+/)
                .filter((word) => word.length > 0);

              let currentX = item.transform[4];
              const baseY = viewport.height - item.transform[5];

              words.forEach((word) => {
                allText += word + " ";

                const width = item.width * (word.length / item.str.length);

                textLocations.push({
                  text: word,
                  x: currentX,
                  y: baseY,
                  width: width,
                  height: item.height,
                  page: pageNumber,
                });

                currentX += width + item.width / item.str.length;
              });

              allText += "\n";
            });
          }

          resolve({ text: allText.trim(), locations: textLocations });
        } catch (error) {
          console.error("Error extracting text from page:", error);
          reject(error);
        }
      })
      .catch((error) => {
        console.error("Error loading the PDF document:", error);
        reject(error);
      });
  });
};
