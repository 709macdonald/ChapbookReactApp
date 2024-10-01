import { v4 as uuidv4 } from "uuid";
import { PDFTextExtraction } from "./PDFTextUtils";
import { imageTextExtraction } from "./ImageTextUtils";
import { wordTextExtraction } from "./wordDocTextUtils";

export const createFilesArray = async (selectedUserFiles) => {
  const processedUserFiles = await Promise.all(
    selectedUserFiles.map(async (file) => {
      try {
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const blobUrl = URL.createObjectURL(file);

        let fileData = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          date: new Date(file.lastModified).toISOString(),
          fileContent,
          blobUrl,
          text: "",
          matchedWords: [],
          locations: [],
          tags: [],
        };

        if (file.type === "application/pdf") {
          const { text, locations } = await PDFTextExtraction(fileData.blobUrl);
          fileData.text = text;
          fileData.locations = locations;
        } else if (file.type.startsWith("image/")) {
          fileData.text = await imageTextExtraction(file);
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          fileData.text = await wordTextExtraction(file);
        }

        return fileData;
      } catch (error) {
        alert(`Failed to extract text from file: ${file.name}`);
        return null;
      }
    })
  );

  return processedUserFiles.filter((file) => file !== null);
};
