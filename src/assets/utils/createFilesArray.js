import { v4 as uuidv4 } from "uuid";
import { PDFTextExtraction } from "./PDFTextUtils";
import { imageTextExtraction } from "./ImageTextUtils";
import { wordTextExtraction } from "./wordDocTextUtils";

/**
 * Ensures a value is an array - useful for normalizing locations data
 * @param {any} value - The value to check/convert
 * @returns {Array} - Either the original array or a new empty array
 */
const ensureArray = (value) => {
  // If it's already an array, return it
  if (Array.isArray(value)) return value;

  // If it's a string that looks like JSON, try to parse it
  if (
    typeof value === "string" &&
    (value.startsWith("[") || value.startsWith("{"))
  ) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // If it's an object with numeric keys (like a JSON object representation of an array)
  if (value && typeof value === "object" && !Array.isArray(value)) {
    // Check if it has numeric keys like {0: item1, 1: item2}
    const keys = Object.keys(value);
    if (keys.length > 0 && keys.every((k) => !isNaN(parseInt(k)))) {
      return Object.values(value);
    }
  }

  // Default to empty array
  return [];
};

/**
 * Processes uploaded files and sends them to the backend for storage.
 * @param {Array<{ url?: string, fileUrl?: string, name?: string, originalname?: string, key?: string, filename?: string }>} uploadedFiles
 * @returns {Promise<Array<Object>>}
 */
export const createFilesArray = async (uploadedFiles) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token) throw new Error("Authentication required for file uploads");
  if (!userId) throw new Error("UserId is missing. Please log in again.");

  const processedFiles = await Promise.all(
    uploadedFiles.map(async (file) => {
      try {
        const fileUrl = file.url || file.fileUrl;
        const fileName = file.name || file.originalname;
        const fileKey = file.key || file.filename;

        if (!fileUrl || !fileName) {
          throw new Error("File URL or name missing");
        }

        const ext = fileName.split(".").pop()?.toLowerCase();

        let fileType = "application/octet-stream";
        if (ext === "pdf") {
          fileType = "application/pdf";
        } else if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
          fileType = `image/${ext}`;
        } else if (["docx", "doc"].includes(ext)) {
          fileType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }

        const fileData = {
          id: uuidv4(),
          name: fileName,
          type: fileType,
          date: new Date().toISOString(),
          fileUrl,
          serverKey: fileKey,
          text: "",
          matchedWords: [],
          locations: [], // Initialize as empty array
          tags: [],
          UserId: userId,
        };

        // Extract text & locations
        if (fileType === "application/pdf") {
          try {
            const result = await PDFTextExtraction(fileUrl);
            fileData.text = result.text || "";
            fileData.locations = ensureArray(result.locations);
          } catch (err) {
            console.error(`Error extracting PDF text:`, err);
            fileData.text = "";
            fileData.locations = [];
          }
        } else if (fileType.startsWith("image/")) {
          try {
            const result = await imageTextExtraction(fileUrl);
            fileData.text = result.text || "";
            fileData.locations = ensureArray(result.locations);
          } catch (err) {
            console.error(`Error extracting image text:`, err);
            fileData.text = "";
            fileData.locations = [];
          }
        } else if (
          fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          try {
            fileData.text = (await wordTextExtraction(fileUrl)) || "";
          } catch (err) {
            console.error(`Error extracting Word document text:`, err);
            fileData.text = "";
          }
        }

        // Send to backend
        await fetch("http://localhost:5005/api/files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(fileData),
        });

        return fileData;
      } catch (err) {
        console.error(
          `❌ Error processing file (${file.url || file.fileUrl}):`,
          err
        );
        return null;
      }
    })
  );

  return processedFiles.filter(Boolean);
};

/**
 * Helper function to normalize file data from the server
 * Ensures that properties like locations are always in the expected format
 * @param {Object} file - The file object from the server
 * @returns {Object} - Normalized file object
 */
export const normalizeFileData = (file) => {
  if (!file) return null;

  return {
    ...file,
    // Ensure these are always arrays
    locations: ensureArray(file.locations),
    matchedWords: Array.isArray(file.matchedWords) ? file.matchedWords : [],
    tags: Array.isArray(file.tags) ? file.tags : [],
  };
};
