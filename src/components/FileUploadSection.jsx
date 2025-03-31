import React, { useState, useEffect } from "react";
import { generateUploadButton, generateReactHelpers } from "@uploadthing/react";
import { createFilesArray } from "../assets/utils/createFilesArray";

// Generate React helpers for UploadThing
const { useUploadThing } = generateReactHelpers({
  url: "http://localhost:5005/api/uploadthing",
});

// Keep the UploadButton for compatibility
const UploadButton = generateUploadButton({
  url: "http://localhost:5005/api/uploadthing",
});

export default function FileUploadSection({
  setFiles,
  setIsLoadingFiles,
  setShowAllFiles,
  setSearchWord,
  setShowIndividualFile,
  setBgLogoOn,
  setNewDocumentPage,
  setHideSearchSection,
  setSelectedUserCreatedFile,
}) {
  const savedFolderName = localStorage.getItem("folderName") || "Select Folder";
  const [folderName, setFolderName] = useState(savedFolderName);
  const [authToken, setAuthToken] = useState(null);

  // Use the UploadThing hook with our token in headers
  const { startUpload, isUploading } = useUploadThing("fileUploader", {
    headers: {
      "x-auth-token": authToken || "",
    },
    onClientUploadComplete: (res) => {
      console.log("✅ Upload complete:", res);
      // You could also update your files state here if needed
    },
    onUploadError: (error) => {
      console.error("❌ Upload failed", error);
      alert(`Upload failed: ${error.message}`);
    },
  });

  useEffect(() => {
    localStorage.setItem("folderName", folderName);
  }, [folderName]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🎯 Setting token from localStorage:", token);
    setAuthToken(token);
  }, []);

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
      setSearchWord("");
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
          {authToken && (
            <div className="fileInputLabel">
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    startUpload(Array.from(e.target.files));
                  }
                }}
                style={{ display: "none" }}
                id="file-input"
                multiple // Allow multiple files if needed
              />
              <label htmlFor="file-input">
                <i className="fa-solid fa-file-medical folderIcon"></i>
              </label>
            </div>
          )}
        </div>

        <div className="tooltip-wrapper">
          <span className="tooltip">New Document</span>
          <button className="newDocumentButton" onClick={showNewDocumentPage}>
            <i className="fa-solid fa-file-pen newDocumentButtonIcon"></i>
          </button>
        </div>
      </div>
      <p className="folderName">{folderName}</p>
      <hr />
    </div>
  );
}
