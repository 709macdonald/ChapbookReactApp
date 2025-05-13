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
  email,
  setEmail,
  setShowTutorial,
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

      <div className="sideBarLogoDiv" onClick={goToMainScreen}>
        <div className="logoText">
          <h2 className="chap">
            Chap<span className="book">book</span>
          </h2>
          <p className="sloganTextSmall">Every File. Every Word. Instantly.</p>
        </div>
      </div>

      {showUserSettings ? (
        <UserSettings
          setShowUserSettings={setShowUserSettings}
          setToggleSideBar={setToggleSideBar}
          setShowAllFiles={setShowAllFiles}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          handleClose={handleCloseUserSettings}
          setFiles={setFiles}
          email={email}
          setEmail={setEmail}
          setShowTutorial={setShowTutorial}
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
        <div className="tooltip-wrapper">
          <span className="tooltip">Open User Settings</span>
          <button
            className="userSettingsButton"
            onClick={handleShowUserSettings}
          >
            <i className="fa-solid fa-user-gear"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
