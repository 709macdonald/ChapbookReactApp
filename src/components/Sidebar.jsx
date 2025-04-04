import React, { useState } from "react";
import FileUploadSection from "./FileUploadSection";
import SearchBarSection from "./SearchBarSection";
import UserSettings from "./UserSettings";

export default function Sidebar({
  files,
  setFiles,
  setIsLoadingFiles,
  resultsCount,
  setShowAllFiles,
  setShowIndividualFile,
  searchWord,
  setSearchWord,
  assistedSearchWords,
  setAssistedSearchWords,
  setBgLogoOn,
  toggleTheme,
  isDarkMode,
  setNewDocumentPage,
  setHideSearchSection,
  hideSearchSection,
  setSelectedUserCreatedFile,
  sortCriteria,
  setSortCriteria,
  toggleSideBar,
  setToggleSideBar,
}) {
  const [showUserSettings, setShowUserSettings] = useState(false);

  const goToMainScreen = () => {
    setIsLoadingFiles(false);
    setShowIndividualFile(false);
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
    setHideSearchSection(false);
    setShowUserSettings(false);
  };

  const handleToggleSideBar = () => {
    setToggleSideBar(!toggleSideBar);
  };

  const handleCloseUserSettings = () => {
    setShowUserSettings(false);
  };

  const handleShowUserSettings = () => {
    setShowUserSettings((prev) => !prev);
  };

  if (!toggleSideBar) {
    return (
      <button className="sideBarButton" onClick={handleToggleSideBar}>
        <i className="fa-solid fa-bars"></i>
      </button>
    );
  }

  return (
    <div className="sidebarDiv">
      <button className="sideBarButton" onClick={handleToggleSideBar}>
        <i className="fa-solid fa-bars"></i>
      </button>
      <div className="sideBarLogoDiv">
        <h2 onClick={goToMainScreen} className="chap">
          Chap<span className="book">book</span>
        </h2>
      </div>

      {/* Conditionally show either settings or the regular sections */}
      {showUserSettings ? (
        <UserSettings
          setShowUserSettings={setShowUserSettings}
          setToggleSideBar={setToggleSideBar}
          setShowAllFiles={setShowAllFiles}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          handleClose={handleCloseUserSettings}
          setFiles={setFiles} // ✅ pass the function that updates your files array
        />
      ) : (
        <>
          <FileUploadSection
            files={files}
            setFiles={setFiles}
            setIsLoadingFiles={setIsLoadingFiles}
            setShowAllFiles={setShowAllFiles}
            setShowIndividualFile={setShowIndividualFile}
            setBgLogoOn={setBgLogoOn}
            setNewDocumentPage={setNewDocumentPage}
            setHideSearchSection={setHideSearchSection}
            setSelectedUserCreatedFile={setSelectedUserCreatedFile}
            setSearchWord={setSearchWord}
          />
          <SearchBarSection
            files={files}
            resultsCount={resultsCount}
            searchWord={searchWord}
            setSearchWord={setSearchWord}
            assistedSearchWords={assistedSearchWords}
            setAssistedSearchWords={setAssistedSearchWords}
            hideSearchSection={hideSearchSection}
            setSortCriteria={setSortCriteria}
            sortCriteria={sortCriteria}
          />
        </>
      )}

      <div className="creatorNameDiv">
        <p>Created By Peter MacDonald</p>
        {/* User settings button */}
        <button className="userSettingsButton" onClick={handleShowUserSettings}>
          <i className="fa-solid fa-user-gear"></i>
        </button>
      </div>
    </div>
  );
}
