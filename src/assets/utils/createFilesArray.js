import { v4 as uuidv4 } from "uuid";
import { PDFTextExtraction } from "./PDFTextUtils";
import { imageTextExtraction } from "./ImageTextUtils";
import { wordTextExtraction } from "./wordDocTextUtils";
import { getBaseUrlWithEnv } from "./backendConnect";

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
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
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.length > 0 && keys.every((k) => !isNaN(parseInt(k)))) {
      return Object.values(value);
    }
  }
  return [];
};

const getSignedUrl = async (fileKey, token) => {
  try {
    const response = await fetch(
      `${getBaseUrlWithEnv()}/api/signed-url/${fileKey}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
};

export const createFilesArray = async (uploadedFiles) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token) throw new Error("Authentication required for file uploads");
  if (!userId) throw new Error("UserId is missing. Please log in again.");

  const processedFiles = await Promise.all(
    uploadedFiles.map(async (file) => {
      try {
        let fileUrl = file.url || file.fileUrl;
        const fileName = file.name || file.originalname;
        const fileKey = file.key || file.filename;

        if (!fileUrl || !fileName) {
          throw new Error("File URL or name missing");
        }

        if (fileUrl && fileUrl.includes("amazonaws.com")) {
          fileUrl = await getSignedUrl(fileKey, token);
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
          locations: [],
          tags: [],
          UserId: userId,
        };

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

        await fetch(`${getBaseUrlWithEnv()}/api/files`, {
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

export const normalizeFileData = (file) => {
  if (!file) return null;

  return {
    ...file,
    locations: ensureArray(file.locations),
    matchedWords: Array.isArray(file.matchedWords) ? file.matchedWords : [],
    tags: Array.isArray(file.tags) ? file.tags : [],
  };
};
