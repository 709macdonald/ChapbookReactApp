import React, { useState, useEffect } from "react";
import { createFilesArray } from "../assets/utils/createFilesArray";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";

export default function FileUploadSection({
  files,
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
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
  }, []);

  useEffect(() => {
    localStorage.setItem("folderName", folderName);
  }, [folderName]);

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to clear all files from Chapbook's library?"
    );

    if (!confirmReset) return;

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId || !token) {
        alert("Missing user information. Please log in again.");
        return;
      }

      const res = await fetch(
        `${getBaseUrlWithEnv()}/api/files/reset/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Reset failed.");
      }

      console.log("✅ Backend reset complete");

      setFiles([]);
      setFolderName("Select Folder");
      setIsLoadingFiles(false);
      setShowIndividualFile(false);
      setBgLogoOn(true);
      setShowAllFiles(true);
      setSearchWord("");
      setNewDocumentPage(false);
      setHideSearchSection(false);
      setUploadError(null);
      localStorage.removeItem("files");
      localStorage.removeItem("folderName");

      alert("All files removed from Chapbook and S3.");
    } catch (err) {
      console.error("❌ Reset error:", err);
      alert("Failed to reset files. Please try again.");
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    const formData = new FormData();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authentication required. Please log in again.");
      return;
    }

    const existingFileNames = new Set(files.map((f) => f.name));
    const newFiles = selectedFiles.filter(
      (file) => !existingFileNames.has(file.name)
    );

    if (newFiles.length === 0) {
      alert("All selected files are already uploaded.");
      return;
    }

    newFiles.forEach((file) => formData.append("files", file));

    try {
      setIsUploading(true);
      setIsLoadingFiles(true);
      setShowAllFiles(false);
      setUploadError(null);

      const res = await fetch(`${getBaseUrlWithEnv()}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Upload failed with status: ${res.status}`
        );
      }

      const uploadedFiles = await res.json();

      const processedFiles = await createFilesArray(uploadedFiles);

      setFiles((prevFiles) => [...prevFiles, ...processedFiles]);
    } catch (err) {
      console.error("❌ S3 Upload or processing error:", err);
      setUploadError(
        err.message || "Something went wrong processing the files."
      );
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setIsLoadingFiles(false);
        setShowAllFiles(true);
      }, 500);
      e.target.value = "";
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
          <span className="tooltip">Upload Files to S3</span>
          {authToken ? (
            <div className="fileInputLabel">
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-input"
                multiple
                disabled={isUploading}
              />
              <label htmlFor="file-input">
                <i
                  className={`fa-solid fa-file-medical folderIcon ${
                    isUploading ? "disabled" : ""
                  }`}
                ></i>
                {isUploading && <span className="upload-spinner"></span>}
              </label>
            </div>
          ) : (
            <div
              className="fileInputLabel disabled"
              title="Please log in to upload files"
            >
              <i className="fa-solid fa-file-medical folderIcon disabled"></i>
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

      {uploadError && <div className="error-message">{uploadError}</div>}

      <hr />
    </div>
  );
}
