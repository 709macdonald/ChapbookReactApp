import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import Sidebar from "./components/Sidebar";
import MainScreen from "./components/MainScreen";
import { getBaseUrlWithEnv } from "./assets/utils/backendConnect";
import "./pdfConfig";
import toast from "react-hot-toast";
import TutorialModal from "./components/TutorialModal";

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
  const [email, setEmail] = useState("");

  const [showTutorial, setShowTutorial] = useState("");

  if (typeof global === "undefined") {
    var global = window;
  }

  const fetchFiles = async () => {
    try {
      setIsLoadingFiles(true);
      setShowAllFiles(false);
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const res = await fetch(`${getBaseUrlWithEnv()}/api/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch user files");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("❌ Error fetching files:", err);
    } finally {
      setIsLoadingFiles(false);
      setShowAllFiles(true);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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

  const handleDeleteFile = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (!confirmDelete) return;

    const fileToDelete = files.find((file) => file.id === id);

    if (!fileToDelete) {
      alert("File not found.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication required. Please log in again.");
        return;
      }

      const res = await fetch(`${getBaseUrlWithEnv()}/api/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Server error on DB delete");

      await fetch(
        `${getBaseUrlWithEnv()}/api/delete-local/${fileToDelete.serverKey}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      setFiles(files.filter((file) => file.id !== id));
      setShowIndividualFile(false);
      setBgLogoOn(true);
      setShowAllFiles(true);

      toast.success("File deleted successfully.");
    } catch (error) {
      console.error("❌ Error deleting file:", error);
      alert("Failed to delete the file. Please try again.");
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
        email={email}
        setEmail={setEmail}
        setShowTutorial={setShowTutorial}
      />
      <MainScreen
        fetchFiles={fetchFiles}
        files={files}
        setFiles={setFiles}
        isLoadingFiles={isLoadingFiles}
        setIsLoadingFiles={setIsLoadingFiles}
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
        setEmail={setEmail}
        email={email}
        setShowTutorial={setShowTutorial}
      />
      {showTutorial && <TutorialModal setShowTutorial={setShowTutorial} />}
    </div>
  );
}

export default App;
