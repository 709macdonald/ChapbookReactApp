import React, { useState } from "react";
import FileUploadSection from "./FileUploadSection";
import SearchBarSection from "./SearchBarSection";

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
  const goToMainScreen = () => {
    setIsLoadingFiles(false);
    setShowIndividualFile(false);
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
    setHideSearchSection(false);
  };

  const handleToggleSideBar = () => {
    setToggleSideBar(!toggleSideBar);
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
      <FileUploadSection
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
      <div className="creatorNameDiv">
        <p>Created By Peter MacDonald</p>
        <button className="toggleThemeButton" onClick={toggleTheme}>
          {isDarkMode ? (
            <i className="fa-solid fa-sun sunIcon"></i>
          ) : (
            <i className="fa-solid fa-moon moonIcon"></i>
          )}
        </button>
      </div>
    </div>
  );
}
