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

  /* STORAGE */

  useEffect(() => {
    const fetchFiles = async () => {
      let userId = localStorage.getItem("userId");

      // 🧠 If it's missing, decode it from the token
      if (!userId) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = jwt_decode(token);
            userId = decoded.userId;
            if (userId) {
              localStorage.setItem("userId", userId); // ✅ Put it back
            }
          } catch (err) {
            console.warn("Failed to decode token:", err);
          }
        }
      }

      if (!userId) {
        console.warn("No userId found. User may not be logged in.");
        return;
      }

      try {
        setIsLoadingFiles(true);

        const res = await fetch(
          `http://localhost:5005/api/files?userId=${userId}`
        );

        if (!res.ok) throw new Error("Failed to fetch user files");

        const data = await res.json();
        setFiles(data);
      } catch (error) {
        console.error("❌ Error fetching user files:", error);
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchFiles();
  }, []);

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
