import mammoth from "mammoth";

export const wordTextExtraction = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;

      try {
        const { value: text } = await mammoth.extractRawText({ arrayBuffer });
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
