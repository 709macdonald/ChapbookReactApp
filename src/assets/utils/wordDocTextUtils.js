import mammoth from "mammoth";

/**
 * Extracts text from a .docx file given its URL
 * @param {string} fileUrl - URL of the uploaded .docx file
 * @returns {Promise<string>}
 */
export const wordTextExtraction = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();

    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("❌ Error extracting text from Word doc:", error);
    return "";
  }
};
