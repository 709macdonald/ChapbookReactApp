import mammoth from "mammoth";

export const wordTextExtraction = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;

      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
