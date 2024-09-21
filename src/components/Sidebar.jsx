import React from "react";
import FileUploadSection from "./FileUploadSection";
import SearchBarSection from "./SearchBarSection";

export default function Sidebar({ files, setFiles, setIsLoadingFiles }) {
  return (
    <div className="sidebarDiv">
      <div className="sideBarLogoDiv">
        <h2 className="chap">
          Chap<span className="book">book</span>
        </h2>
      </div>
      <FileUploadSection
        files={files}
        setFiles={setFiles}
        setIsLoadingFiles={setIsLoadingFiles}
      />
      <SearchBarSection />
      <div className="creatorNameDiv">Created By Peter MacDonald</div>
    </div>
  );
}
