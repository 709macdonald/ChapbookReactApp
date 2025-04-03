import React, { useState, useEffect } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import { createFilesArray } from "../assets/utils/createFilesArray";

const { useUploadThing } = generateReactHelpers({
  url: "http://localhost:5005/api/uploadthing",
  isDev: true,
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
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🎯 Setting token from localStorage:", token);
    setAuthToken(token);
  }, []);

  useEffect(() => {
    localStorage.setItem("folderName", folderName);
  }, [folderName]);

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(
    "fileUploader",
    {
      headers: {
        "x-auth-token": authToken || "",
      },
      onClientUploadComplete: (res) => {
        console.log("✅ Upload complete:", res);
        if (res && res.length > 0) {
          setFiles((prevFiles) => [...prevFiles, ...res]);

          setUploadError(null);

          alert(`Successfully uploaded ${res.length} file(s)`);
        }
      },
      onUploadError: (error) => {
        console.error("❌ Upload failed", error);
        setUploadError(error.message || "Upload failed");
        alert(`Upload failed: ${error.message}`);
      },
    }
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("Starting upload with files:", e.target.files);
      setUploadError(null);

      try {
        startUpload(Array.from(e.target.files));
      } catch (error) {
        console.error("Error starting upload:", error);
        setUploadError("Failed to start upload process");
      }
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
      setBgLogoOn(true);
      setShowAllFiles(true);
      setSearchWord("");
      setNewDocumentPage(false);
      setHideSearchSection(false);
      setUploadError(null);
      localStorage.removeItem("files");
      localStorage.removeItem("folderName");
    }
  };

  const handleFileChangeLocal = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("http://localhost:5005/api/upload-local", {
        method: "POST",
        body: formData,
      });

      const uploadedFiles = await res.json();
      console.log("📦 Multer uploaded:", uploadedFiles);

      const formattedUploadedFiles = uploadedFiles.map((file) => ({
        url: file.fileUrl, // ✅ fixed to exactly match backend
        name: file.name, // ✅ fixed to exactly match backend
        key: file.key, // ✅ fixed to exactly match backend
      }));

      const processedFiles = await createFilesArray(formattedUploadedFiles);

      console.log("✅ Processed files:", processedFiles);
      setFiles((prev) => [...prev, ...processedFiles]);

      alert(
        `Successfully uploaded and processed ${processedFiles.length} file(s)`
      );
    } catch (err) {
      console.error("❌ Upload or processing error:", err);
      setUploadError("Something went wrong processing the file.");
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
          {authToken ? (
            <div className="fileInputLabel">
              <input
                type="file"
                onChange={handleFileChangeLocal}
                style={{ display: "none" }}
                id="file-input"
                multiple
                disabled={isUploading}
              />
              <label htmlFor="file-input">
                <i
                  className={`fa-solid ${
                    isUploading ? "fa-spinner fa-spin" : "fa-file-medical"
                  } folderIcon`}
                ></i>
              </label>
              {isUploading && (
                <span className="upload-status">Uploading...</span>
              )}
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
