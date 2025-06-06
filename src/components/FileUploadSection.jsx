import React, { useState, useEffect } from "react";
import { createFilesArray } from "../assets/utils/createFilesArray";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";
import toast from "react-hot-toast";

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
  const [authToken, setAuthToken] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
  }, []);

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

      setFiles([]);
      setIsLoadingFiles(false);
      setShowIndividualFile(false);
      setBgLogoOn(true);
      setShowAllFiles(true);
      setSearchWord("");
      setNewDocumentPage(false);
      setHideSearchSection(false);
      localStorage.removeItem("files");

      alert("All files removed from Chapbook and S3.");
    } catch (err) {
      console.error("❌ Reset error:", err);
      alert("Failed to reset files. Please try again.");
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

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

    // === 🚫 Validation ===
    const MAX_FILES = 20;
    const MAX_FILE_SIZE_MB = 100;
    const MAX_TOTAL_SIZE_MB = 100;
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];

    if (files.length + newFiles.length > MAX_FILES) {
      alert(`You can only upload up to ${MAX_FILES} files total.`);
      return;
    }

    const invalidFiles = newFiles.filter(
      (file) =>
        !allowedExtensions.includes(file.name.split(".").pop()?.toLowerCase())
    );
    if (invalidFiles.length > 0) {
      alert(
        "Some files are not supported. Please upload PDFs, images, or Word docs."
      );
      return;
    }

    const totalSizeMB =
      files.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024) +
      newFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      alert("Total upload limit exceeded. Max 100MB allowed per user.");
      return;
    }

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} exceeds the 100MB file size limit.`);
        return;
      }
    }

    const formData = new FormData();
    newFiles.forEach((file) => formData.append("files", file));

    try {
      setIsUploading(true);
      setIsLoadingFiles(true);
      setShowAllFiles(false);

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

      if (processedFiles.length > 0) {
        toast.success(
          `${processedFiles.length} file${
            processedFiles.length > 1 ? "s" : ""
          } uploaded successfully!`
        );
      } else {
        toast("Files uploaded, but none were processed.", { icon: "⚠️" });
      }
    } catch (err) {
      console.error("❌ S3 Upload or processing error:", err);
      alert("Upload failed. S3 processing error");
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
      <div className="tooltip-wrapper">
        <span className="tooltip">Delete all files from Chapbook</span>
        <button onClick={handleReset} className="resetButton">
          Reset
        </button>
      </div>
      <hr />

      <div className="sideBarButtonsDiv">
        <div className="fileInputDiv tooltip-wrapper">
          <span className="tooltip">Upload Files</span>
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
      <hr />
    </div>
  );
}
