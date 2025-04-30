import React, { useState } from "react";
import LoadingGear from "./LoadingGear";
import BGLogo from "./BGLogo";
import FileSearchScreen from "./FileSearchScreen";
import IndividualFileScreen from "./IndividualFileScreen";
import NewDocumentPage from "./NewDocumentPage";
import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";

export default function MainScreen({
  files,
  setFiles,
  isLoadingFiles,
  setResultsCount,
  showAllFiles,
  setShowAllFiles,
  showIndividualFile,
  setShowIndividualFile,
  handleDeleteFile,
  searchWord,
  assistedSearchWords,
  bgLogoOn,
  setBgLogoOn,
  newDocumentPage,
  setNewDocumentPage,
  setHideSearchSection,
  selectedUserCreatedFile,
  setSelectedUserCreatedFile,
  sortCriteria,
  setToggleSideBar,
  fetchFiles,
  setIsLoadingFiles,
  setEmail,
  email,
}) {
  const [individualFile, setIndividualFile] = useState(null);
  const [showSignUpScreen, SetShowSignUpScreen] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(true);

  const openIndividualFile = (file) => {
    setShowAllFiles(false);
    setBgLogoOn(false);

    if (file.type === "application/draft-js") {
      console.log("Opening draft-js file:", file);
      const fileToPass = {
        ...file,
        fileContent: file.fileContent,
      };
      setNewDocumentPage(true);
      setShowIndividualFile(false);
      setHideSearchSection(true);
      setSelectedUserCreatedFile(fileToPass);
      setIndividualFile(null);
    } else {
      console.log("Opening non-draft-js file:", file);
      setNewDocumentPage(false);
      setShowIndividualFile(true);
      setHideSearchSection(false);
      setIndividualFile(file);
      setSelectedUserCreatedFile(null);
    }
  };

  const backToAllFileView = () => {
    setIndividualFile(null);
    setShowIndividualFile(false);
    setBgLogoOn(true);
    setShowAllFiles(true);
  };

  const onUpdateFileTags = (updateFn) => {
    setFiles((prevFiles) => {
      const updatedFiles = updateFn(prevFiles);
      const updatedFile = updatedFiles.find((f) => f.id === individualFile.id);
      setIndividualFile(updatedFile);
      return updatedFiles;
    });
  };

  const handleAddTag = async (fileId, newTag, currentTags) => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;

    // Don't add duplicate tags
    if (currentTags.includes(trimmedTag)) {
      return currentTags;
    }

    const updatedTags = [...currentTags, trimmedTag];

    // If a fileId exists, update the file's tags in the backend
    if (fileId) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${getBaseUrlWithEnv()}/api/files/${fileId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tags: updatedTags }),
          credentials: "include",
        });
      } catch (err) {
        console.error("Error updating file tags:", err);
      }
    }

    // Update files in the state
    setFiles((prevFiles) =>
      prevFiles.map((f) => {
        if (f.id === fileId) {
          return { ...f, tags: updatedTags };
        }
        return f;
      })
    );

    // If we're viewing an individual file, update it too
    if (individualFile && individualFile.id === fileId) {
      setIndividualFile({ ...individualFile, tags: updatedTags });
    }

    // If we have a selected user created file, update it too
    if (selectedUserCreatedFile && selectedUserCreatedFile.id === fileId) {
      setSelectedUserCreatedFile({
        ...selectedUserCreatedFile,
        tags: updatedTags,
      });
    }

    return updatedTags;
  };

  const handleRemoveTag = async (fileId, index, currentTags) => {
    const updatedTags = [...currentTags];
    updatedTags.splice(index, 1);

    if (fileId) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${getBaseUrlWithEnv()}/api/files/${fileId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tags: updatedTags }),
          credentials: "include",
        });
      } catch (err) {
        console.error("Error updating file tags:", err);
      }
    }

    setFiles((prevFiles) =>
      prevFiles.map((f) => {
        if (f.id === fileId) {
          return { ...f, tags: updatedTags };
        }
        return f;
      })
    );

    if (individualFile && individualFile.id === fileId) {
      setIndividualFile({ ...individualFile, tags: updatedTags });
    }

    if (selectedUserCreatedFile && selectedUserCreatedFile.id === fileId) {
      setSelectedUserCreatedFile({
        ...selectedUserCreatedFile,
        tags: updatedTags,
      });
    }

    return updatedTags;
  };

  return (
    <div className="mainScreenDiv">
      {(showLoginScreen || showSignUpScreen) && (
        <div className="centerWrapperDiv">
          <LoginScreen
            setToggleSideBar={setToggleSideBar}
            setShowAllFiles={setShowAllFiles}
            SetShowSignUpScreen={SetShowSignUpScreen}
            showLoginScreen={showLoginScreen}
            setShowLoginScreen={setShowLoginScreen}
            fetchFiles={fetchFiles}
            setEmail={setEmail}
            email={email}
          />
          <SignUpScreen
            setToggleSideBar={setToggleSideBar}
            showSignUpScreen={showSignUpScreen}
            SetShowSignUpScreen={SetShowSignUpScreen}
            setShowLoginScreen={setShowLoginScreen}
            setShowAllFiles={setShowAllFiles}
            setEmail={setEmail}
            email={email}
          />
        </div>
      )}
      <BGLogo bgLogoOn={bgLogoOn} />
      <LoadingGear isLoadingFiles={isLoadingFiles} />
      <FileSearchScreen
        files={files}
        setResultsCount={setResultsCount}
        showAllFiles={showAllFiles}
        setShowIndividualFile={setShowIndividualFile}
        handleDeleteFile={handleDeleteFile}
        openIndividualFile={openIndividualFile}
        searchWord={searchWord}
        assistedSearchWords={assistedSearchWords}
        sortCriteria={sortCriteria}
      />
      <IndividualFileScreen
        file={individualFile}
        showIndividualFile={showIndividualFile}
        setShowAllFiles={setShowAllFiles}
        searchWord={searchWord}
        assistedSearchWords={assistedSearchWords}
        handleDeleteFile={handleDeleteFile}
        backToAllFileView={backToAllFileView}
        handleAddTag={handleAddTag}
        handleRemoveTag={handleRemoveTag}
      />
      <NewDocumentPage
        setIsLoadingFiles={setIsLoadingFiles}
        newDocumentPage={newDocumentPage}
        setNewDocumentPage={setNewDocumentPage}
        setShowAllFiles={setShowAllFiles}
        setBgLogoOn={setBgLogoOn}
        setHideSearchSection={setHideSearchSection}
        files={files}
        setFiles={setFiles}
        selectedUserCreatedFile={selectedUserCreatedFile}
        handleAddTag={handleAddTag}
        handleRemoveTag={handleRemoveTag}
      />
    </div>
  );
}
