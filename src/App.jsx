import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainScreen from "./components/MainScreen";

function App() {
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(true);
  const [showIndividualFile, setShowIndividualFile] = useState(false);

  /* LOCAL STORAGE */

  useEffect(() => {
    const storedFiles = localStorage.getItem("files");
    if (storedFiles) {
      try {
        const parsedFiles = JSON.parse(storedFiles);

        const updatedFiles = parsedFiles.map((file) => {
          const byteString = atob(file.fileContent.split(",")[1]);
          const mimeString = file.fileContent
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];

          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([ab], { type: mimeString });
          const blobUrl = URL.createObjectURL(blob);

          return { ...file, blobUrl };
        });

        setFiles(updatedFiles);
      } catch (error) {
        console.error("Failed to parse files from local storage", error);
        localStorage.removeItem("files");
      }
    }
  }, []);

  useEffect(() => {
    if (files.length > 0) {
      const filesToStore = files.map(({ blobUrl, ...rest }) => rest);
      localStorage.setItem("files", JSON.stringify(filesToStore));
    }
  }, [files]);

  /* SEE WHAT FILES ARRAY IS DOING FOR NOW */
  useEffect(() => {
    console.log("Updated files:", files);
  }, [files]);

  /* DELETE FILES */

  const handleDeleteFile = (id) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);
  };

  return (
    <div className="containerDiv">
      <Sidebar
        files={files}
        setFiles={setFiles}
        setIsLoadingFiles={setIsLoadingFiles}
      />
      <MainScreen
        files={files}
        setFiles={setFiles}
        isLoadingFiles={isLoadingFiles}
        showAllFiles={showAllFiles}
        setShowAllFiles={setShowAllFiles}
        showIndividualFile={showIndividualFile}
        setShowIndividualFile={setShowIndividualFile}
        handleDeleteFile={handleDeleteFile}
      />
    </div>
  );
}

export default App;
