import { v4 as uuidv4 } from "uuid";
import { PDFTextExtraction } from "./PDFTextUtils";
import { imageTextExtraction } from "./ImageTextUtils";
import { wordTextExtraction } from "./wordDocTextUtils";

export const createFilesArray = async (
  uploadedFiles,
  fromUploadThing = false
) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication required for file uploads");

  const processedFiles = await Promise.all(
    uploadedFiles.map(async (file) => {
      try {
        const fileUrl = fromUploadThing ? file.url : file.fileUrl;
        const fileName = file.name;
        const fileKey = file.key;

        let fileType = "";
        const ext = fileName.split(".").pop()?.toLowerCase();

        if (ext === "pdf") {
          fileType = "application/pdf";
        } else if (["jpg", "jpeg", "png"].includes(ext)) {
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
          fileUrl: fileUrl,
          serverKey: fileKey,
          text: "",
          matchedWords: [],
          locations: [],
          tags: [],
        };

        // Text extraction based on type
        if (fileType === "application/pdf") {
          const { text, locations } = await PDFTextExtraction(fileUrl);
          fileData.text = text;
          fileData.locations = locations;
        } else if (fileType.startsWith("image/")) {
          const { text, locations } = await imageTextExtraction(fileUrl);
          fileData.text = text;
          fileData.locations = locations;
        } else if (
          fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          fileData.text = await wordTextExtraction(fileUrl);
        }

        return fileData;
      } catch (err) {
        console.error(`❌ Error processing ${file.name}:`, err);
        return null;
      }
    })
  );

  return processedFiles.filter((f) => f !== null);
};
