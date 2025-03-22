import React, { useState } from "react";
import LoadingGear from "./LoadingGear";
import BGLogo from "./BGLogo";
import FileSearchScreen from "./FileSearchScreen";
import IndividualFileScreen from "./IndividualFileScreen";
import NewDocumentPage from "./NewDocumentPage";
import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";

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

  return (
    <div className="mainScreenDiv">
      <LoginScreen
        setToggleSideBar={setToggleSideBar}
        setShowAllFiles={setShowAllFiles}
        SetShowSignUpScreen={SetShowSignUpScreen}
        showLoginScreen={showLoginScreen}
        setShowLoginScreen={setShowLoginScreen}
      />
      <SignUpScreen
        setToggleSideBar={setToggleSideBar}
        showSignUpScreen={showSignUpScreen}
        SetShowSignUpScreen={SetShowSignUpScreen}
        setShowLoginScreen={setShowLoginScreen}
        setShowAllFiles={setShowAllFiles}
      />
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
        onUpdateFileTags={onUpdateFileTags}
      />
      <NewDocumentPage
        newDocumentPage={newDocumentPage}
        setNewDocumentPage={setNewDocumentPage}
        setShowAllFiles={setShowAllFiles}
        setBgLogoOn={setBgLogoOn}
        setHideSearchSection={setHideSearchSection}
        files={files}
        setFiles={setFiles}
        selectedUserCreatedFile={selectedUserCreatedFile}
      />
    </div>
  );
}
