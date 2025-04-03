import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainScreen from "./components/MainScreen";

function App() {
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [toggleSideBar, setToggleSideBar] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [showIndividualFile, setShowIndividualFile] = useState(false);
  const [bgLogoOn, setBgLogoOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [newDocumentPage, setNewDocumentPage] = useState(false);
  const [hideSearchSection, setHideSearchSection] = useState(false);
  const [selectedUserCreatedFile, setSelectedUserCreatedFile] = useState(null);

  const [searchWord, setSearchWord] = useState("");
  const [assistedSearchWords, setAssistedSearchWords] = useState([]);

  const [sortCriteria, setSortCriteria] = useState("name");

  if (typeof global === "undefined") {
    var global = window;
  }

  useEffect(() => {
    console.log("Files state updated:", files);
  }, [files]);

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
          if (file.type === "application/draft-js") {
            return file;
          }

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
      const filesToStore = files.map((file) => {
        if (file.type === "application/draft-js") {
          return file;
        }
        const { blobUrl, ...rest } = file;
        return rest;
      });
      localStorage.setItem("files", JSON.stringify(filesToStore));
    }
  }, [files]);

  /* DELETE FILES */

  const handleDeleteFile = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (confirmDelete) {
      const fileToDelete = files.find((file) => file.id === id);

      if (!fileToDelete) {
        alert("File not found.");
        return;
      }

      try {
        // Make backend call to delete the file
        const res = await fetch(
          `http://localhost:5005/api/delete-local/${fileToDelete.serverKey}`,
          { method: "DELETE" }
        );

        if (!res.ok) {
          throw new Error("Server responded with an error.");
        }

        // Remove file from frontend state after successful deletion
        setFiles(files.filter((file) => file.id !== id));
        setShowIndividualFile(false);
        setBgLogoOn(true);
        setShowAllFiles(true);

        alert("File deleted successfully.");
      } catch (error) {
        console.error("❌ Error deleting file:", error);
        alert("Failed to delete the file. Please try again.");
      }
    }
  };

  return (
    <div className="containerDiv">
      <Sidebar
        toggleSideBar={toggleSideBar}
        setToggleSideBar={setToggleSideBar}
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
        hideSearchSection={hideSearchSection}
        setHideSearchSection={setHideSearchSection}
        setSelectedUserCreatedFile={setSelectedUserCreatedFile}
        sortCriteria={sortCriteria}
        setSortCriteria={setSortCriteria}
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
        setHideSearchSection={setHideSearchSection}
        selectedUserCreatedFile={selectedUserCreatedFile}
        setSelectedUserCreatedFile={setSelectedUserCreatedFile}
        sortCriteria={sortCriteria}
        setToggleSideBar={setToggleSideBar}
      />
    </div>
  );
}

export default App;
