import React, { useState, useEffect } from "react";
import { createFilesArray } from "../assets/utils/createFilesArray";

export default function FileUploadSection({
  setFiles,
  setIsLoadingFiles,
  setShowAllFiles,
  setShowIndividualFile,
  setBgLogoOn,
  setNewDocumentPage,
  setHideSearchSection,
  setSelectedUserCreatedFile,
}) {
  const savedFolderName = localStorage.getItem("folderName") || "Select Folder";
  const [folderName, setFolderName] = useState(savedFolderName);
  const [folderInputKey, setFolderInputKey] = useState(0);

  /* FOLDER NAME LOCAL STORAGE */

  useEffect(() => {
    localStorage.setItem("folderName", folderName);
  }, [folderName]);

  /* UPLOAD FILES */

  const selectUserFiles = async (event) => {
    const selectedUserFiles = Array.from(event.target.files);

    if (selectedUserFiles.length > 0) {
      setIsLoadingFiles(true);
      setBgLogoOn(false);
      setShowAllFiles(false);
      setShowIndividualFile(false);

      const folderSelected = selectedUserFiles[0].webkitRelativePath
        ? selectedUserFiles[0].webkitRelativePath.split("/")[0]
        : "Selected Files";
      setFolderName(folderSelected);

      const processedUserFiles = await createFilesArray(selectedUserFiles);
      setFiles((prevFiles) => [...prevFiles, ...processedUserFiles]);

      setIsLoadingFiles(false);
      setBgLogoOn(true);
      setShowAllFiles(true);

      setFolderInputKey((prevKey) => prevKey + 1);
    }
  };

  /* RESET CHAPBOOK */

  const handleReset = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to clear all files from Chapbook's library?"
    );

    if (confirmReset) {
      setFiles([]);
      setFolderName("Select Folder");
      setIsLoadingFiles(false);
      setShowIndividualFile(false);
      setBgLogoOn(true);
      setShowAllFiles(true);
      setNewDocumentPage(false);
      setHideSearchSection(false);
      localStorage.removeItem("files");
      localStorage.removeItem("folderName");
    }
  };

  const showNewDocumentPage = () => {
    setNewDocumentPage(true);
    setIsLoadingFiles(false);
    setShowIndividualFile(false);
    setBgLogoOn(false);
    setShowAllFiles(false);
    setHideSearchSection(true);
    setSelectedUserCreatedFile(null);
  };

  return (
    <div className="fileUploadSectionDiv">
      <button onClick={handleReset} className="resetButton">
        Reset
      </button>
      <hr />
      <div className="sideBarButtonsDiv">
        <div className="fileInputDiv tooltip-wrapper">
          <span className="tooltip">Upload Files</span>
          <input
            type="file"
            onChange={selectUserFiles}
            accept="application/pdf, image/*, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword"
            multiple
            className="fileInput"
            id="fileInputFiles"
          />
          <label htmlFor="fileInputFiles" className="fileInputLabel">
            <i class="fa-solid fa-file-medical folderIcon"></i>
          </label>
        </div>
        <div className="fileInputDiv tooltip-wrapper">
          <span className="tooltip">Upload Folder</span>
          <input
            key={folderInputKey}
            type="file"
            onChange={selectUserFiles}
            webkitdirectory=""
            className="fileInput"
            id="fileInputDirectory"
          />
          <label htmlFor="fileInputDirectory" className="fileInputLabel">
            <i class="fa-solid fa-folder-plus folderIcon"></i>
          </label>
        </div>
        <div className="tooltip-wrapper">
          <span className="tooltip">New Document</span>
          <button className="newDocumentButton" onClick={showNewDocumentPage}>
            <i class="fa-solid fa-file-pen newDocumentButtonIcon"></i>
          </button>
        </div>
      </div>
      <p className="folderName">{folderName}</p>
      <hr />
    </div>
  );
}
