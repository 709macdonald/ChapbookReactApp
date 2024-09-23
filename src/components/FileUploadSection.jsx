import React, { useState, useEffect } from "react";
import { createFilesArray } from "../assets/utils/createFilesArray";

export default function FileUploadSection({
  setFiles,
  setIsLoadingFiles,
  resultsCount,
  setShowAllFiles,
  setShowIndividualFile,
}) {
  const [folderName, setFolderName] = useState("Select Folder");

  const selectUserFiles = async (event) => {
    const selectedUserFiles = Array.from(event.target.files);

    if (selectedUserFiles.length > 0) {
      setIsLoadingFiles(true);
      setShowAllFiles(false);
      setShowIndividualFile(false);

      const folderSelected = selectedUserFiles[0].webkitRelativePath
        ? selectedUserFiles[0].webkitRelativePath.split("/")[0]
        : "Selected Files";
      setFolderName(folderSelected);

      const processedUserFiles = await createFilesArray(selectedUserFiles);
      setFiles((prevFiles) => [...prevFiles, ...processedUserFiles]);

      setIsLoadingFiles(false);
      setShowAllFiles(true);
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to clear all files from Chapbook's library?"
    );

    if (confirmReset) {
      setFiles([]);
      setFolderName("Select Folder");
      setIsLoadingFiles(false);
      setShowIndividualFile(false);
      setShowAllFiles(true);
      localStorage.removeItem("files");
    }
  };

  return (
    <div className="fileUploadSectionDiv">
      <button onClick={handleReset} className="resetButton">
        Reset
      </button>
      <hr />
      <div className="fileInputDiv">
        <input
          type="file"
          onChange={selectUserFiles}
          accept="application/pdf, image/*, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword"
          multiple
          className="fileInput"
          id="fileInputFiles"
        />
        <label htmlFor="fileInputFiles" className="fileInputLabel">
          <i className="fa-solid fa-file folderIcon"></i> Select Files
        </label>
      </div>
      <hr />
      <div className="fileInputDiv">
        <input
          type="file"
          onChange={selectUserFiles}
          webkitdirectory=""
          className="fileInput"
          id="fileInputDirectory"
        />
        <label htmlFor="fileInputDirectory" className="fileInputLabel">
          <i className="fa-solid fa-folder folderIcon"></i> Select Folder
        </label>
      </div>
      <hr />
      <div className="folderNameDiv">
        <p className="folderName">{folderName}</p>
        <p className="resultsFound">{resultsCount} results found </p>
      </div>
    </div>
  );
}
