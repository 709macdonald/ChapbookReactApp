import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainScreen from "./components/MainScreen";

function App() {
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const [showAllFiles, setShowAllFiles] = useState(true);
  const [showIndividualFile, setShowIndividualFile] = useState(false);
  const [bgLogoOn, setBgLogoOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [newDocumentPage, setNewDocumentPage] = useState(false);

  const [searchWord, setSearchWord] = useState("");
  const [assistedSearchWords, setAssistedSearchWords] = useState([]);

  /* LIGHT AND DARK MODE  */

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const bodyClass = document.body.classList;

    if (newMode) {
      bodyClass.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      bodyClass.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
  };

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "enabled") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

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

  /* DELETE FILES */

  const handleDeleteFile = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (confirmDelete) {
      const updatedFiles = files.filter((file) => file.id !== id);
      setFiles(updatedFiles);
      setShowIndividualFile(false);
      setBgLogoOn(true);
      setShowAllFiles(true);
    }
  };

  return (
    <div className="containerDiv">
      <Sidebar
        files={files}
        setFiles={setFiles}
        setIsLoadingFiles={setIsLoadingFiles}
        resultsCount={resultsCount}
        setShowAllFiles={setShowAllFiles}
        setShowIndividualFile={setShowIndividualFile}
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        assistedSearchWords={assistedSearchWords}
        setAssistedSearchWords={setAssistedSearchWords}
        setBgLogoOn={setBgLogoOn}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        setNewDocumentPage={setNewDocumentPage}
      />
      <MainScreen
        files={files}
        setFiles={setFiles}
        isLoadingFiles={isLoadingFiles}
        setResultsCount={setResultsCount}
        showAllFiles={showAllFiles}
        setShowAllFiles={setShowAllFiles}
        showIndividualFile={showIndividualFile}
        setShowIndividualFile={setShowIndividualFile}
        handleDeleteFile={handleDeleteFile}
        searchWord={searchWord}
        assistedSearchWords={assistedSearchWords}
        bgLogoOn={bgLogoOn}
        setBgLogoOn={setBgLogoOn}
        newDocumentPage={newDocumentPage}
        setNewDocumentPage={setNewDocumentPage}
      />
    </div>
  );
}

export default App;
