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
  const goToMainScreen = () => {
    setIsLoadingFiles(false);
    setShowIndividualFile(false);
    setBgLogoOn(true);
    setShowAllFiles(true);
  };

  return (
    <div className="sidebarDiv">
      <div className="sideBarLogoDiv">
        <h2 onClick={goToMainScreen} className="chap">
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
