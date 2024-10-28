import React, { useState, useEffect } from "react";
import { createFilesArray } from "../assets/utils/createFilesArray";

export default function FileUploadSection({
  setFiles,
  setIsLoadingFiles,
  setShowAllFiles,
  setShowIndividualFile,
  setBgLogoOn,
  setNewDocumentPage,
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
      setFolderName(folderSelected); // Set the folder name to display

      const processedUserFiles = await createFilesArray(selectedUserFiles);
      setFiles((prevFiles) => [...prevFiles, ...processedUserFiles]);

      setIsLoadingFiles(false);
      setBgLogoOn(true);
      setShowAllFiles(true);

      // Reset the folder input field to allow re-uploading the same folder
      setFolderInputKey((prevKey) => prevKey + 1);
    }
  };

  /* RESET BUTTON */

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
  };

  return (
    <div className="fileUploadSectionDiv">
      <button onClick={handleReset} className="resetButton">
        Reset
      </button>
      <hr />
      <div className="sideBarButtonsDiv">
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
            <i className="fa-solid fa-file folderIcon"></i>
          </label>
        </div>
        <div className="fileInputDiv">
          <input
            key={folderInputKey} // Reset input on key change
            type="file"
            onChange={selectUserFiles}
            webkitdirectory=""
            className="fileInput"
            id="fileInputDirectory"
          />
          <label htmlFor="fileInputDirectory" className="fileInputLabel">
            <i className="fa-solid fa-folder folderIcon"></i>
          </label>
        </div>
        <button className="newDocumentButton" onClick={showNewDocumentPage}>
          <i className="fa-solid fa-file-circle-plus newDocumentButtonIcon"></i>
        </button>
      </div>
      <p className="folderName">{folderName}</p>

      <hr />
    </div>
  );
}
