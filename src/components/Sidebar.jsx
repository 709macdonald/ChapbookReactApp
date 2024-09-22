import React from "react";
import FileUploadSection from "./FileUploadSection";
import SearchBarSection from "./SearchBarSection";

export default function Sidebar({
  setFiles,
  setIsLoadingFiles,
  searchWord,
  setSearchWord,
  suggestions,
  setSuggestions,
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
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
      />
      <div className="creatorNameDiv">Created By Peter MacDonald</div>
    </div>
  );
}
