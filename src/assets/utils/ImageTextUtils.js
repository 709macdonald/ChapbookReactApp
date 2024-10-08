import Tesseract from "tesseract.js";

export const imageTextExtraction = (file) => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m), // Optional: for logging progress
    })
      .then(({ data }) => {
        let allText = "";
        const textLocations = [];

        data.words.forEach((word) => {
          allText += word.text + " ";

          textLocations.push({
            text: word.text,
            x: word.bbox.x0,
            y: word.bbox.y0,
            width: word.bbox.x1 - word.bbox.x0,
            height: word.bbox.y1 - word.bbox.y0,
            confidence: word.confidence,
          });
        });

        resolve({
          text: allText.trim(),
          locations: textLocations,
        });
      })
      .catch(reject);
  });
};
