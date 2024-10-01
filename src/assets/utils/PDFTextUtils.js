import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

// Assume this function extracts text and locations
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

            textContent.items.forEach((item) => {
              allText += item.str + " ";
              textLocations.push({
                text: item.str,
                transform: item.transform,
                page: pageNumber, // Include the page number here
              });
            });

            allText += "\n";
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
