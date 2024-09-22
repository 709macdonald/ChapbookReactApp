import React from "react";
import FileUploadSection from "./FileUploadSection";
import SearchBarSection from "./SearchBarSection";

export default function Sidebar({
  files,
  setFiles,
  setIsLoadingFiles,
  searchWord,
  setSearchWord,
  assistedSearchWords,
  setAssistedSearchWords,
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
      />
      <SearchBarSection
        files={files}
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        assistedSearchWords={assistedSearchWords}
        setAssistedSearchWords={setAssistedSearchWords}
      />
      <div className="creatorNameDiv">Created By Peter MacDonald</div>
    </div>
  );
}
