import React, { useState } from "react";
import LoadingGear from "./LoadingGear";
import BGLogo from "./BGLogo";
import FileSearchScreen from "./FileSearchScreen";
import IndividualFileScreen from "./IndividualFileScreen";
import NewDocumentPage from "./NewDocumentPage";

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
}) {
  const [individualFile, setIndividualFile] = useState(null);
  const [selectedUserCreatedFile, setSelectedUserCreatedFile] = useState(null);

  const openIndividualFile = (file) => {
    if (file.type === "application/draft-js") {
      setNewDocumentPage(true);
      setShowIndividualFile(false);
      setBgLogoOn(false);
      setShowAllFiles(false);
      setHideSearchSection(true);
      setSelectedDraftFile(file);
    }
    setIndividualFile(file);
    setShowAllFiles(false);
    setBgLogoOn(false);
    setShowIndividualFile(true);
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
        setSelectedUserCreatedFile={setSelectedUserCreatedFile}
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
