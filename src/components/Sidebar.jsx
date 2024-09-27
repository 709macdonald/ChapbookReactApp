import React from "react";
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
}) {
  return (
    <div className="sidebarDiv">
      <div className="sideBarLogoDiv">
        <h2 className="chap">
          Chap<span className="book">book</span>
        </h2>
      </div>
      <FileUploadSection
        setFiles={setFiles}
        setIsLoadingFiles={setIsLoadingFiles}
        resultsCount={resultsCount}
        setShowAllFiles={setShowAllFiles}
        setShowIndividualFile={setShowIndividualFile}
        setBgLogoOn={setBgLogoOn}
      />
      <SearchBarSection
        files={files}
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        assistedSearchWords={assistedSearchWords}
        setAssistedSearchWords={setAssistedSearchWords}
      />

      <div className="creatorNameDiv">
        Created By Peter MacDonald
        <button className="themeToggleButton" onClick={toggleTheme}>
          {isDarkMode ? (
            <i className="fa-solid fa-sun sunIcon"></i> // Sun icon for light mode
          ) : (
            <i className="fa-solid fa-moon moonIcon"></i> // Moon icon for dark mode
          )}
        </button>
      </div>
    </div>
  );
}
