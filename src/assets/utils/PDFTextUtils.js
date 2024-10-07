import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

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

            // Iterate over text items and extract words individually
            textContent.items.forEach((item) => {
              const words = item.str.split(" "); // Split the line into words

              // Track current X position for highlighting
              let currentX = item.transform[4]; // Start position for this item

              words.forEach((word) => {
                allText += word + " ";

                // Push each word with its corresponding position
                textLocations.push({
                  text: word,
                  x: currentX, // Use current X position
                  y: item.transform[5], // Y coordinate from transform
                  page: pageNumber,
                });

                // Update currentX based on the width of the current word
                const width =
                  item.str.length > 0 ? item.width / item.str.length : 0; // Approximate width per character
                currentX += width * word.length; // Move to next word's starting position
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
