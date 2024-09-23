import React, { useState } from "react";
import LoadingGear from "./LoadingGear";
import BGLogo from "./BGLogo";
import FileSearchScreen from "./FileSearchScreen";
import IndividualFileScreen from "./IndividualFileScreen";

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
}) {
  const [individualFile, setIndividualFile] = useState(null);

  const openIndividualFile = (file) => {
    setIndividualFile(file);
    setShowAllFiles(false);
    setShowIndividualFile(true);
  };

  const backToAllFileView = () => {
    setIndividualFile(null);
    setShowAllFiles(true);
    setShowIndividualFile(false);
  };

  const onUpdateFileTags = (updateFn) => {
    setFiles((prevFiles) => {
      const updatedFiles = updateFn(prevFiles);
      const updatedFile = updatedFiles.find((f) => f.id === indvidualFile.id);
      setIndividualFile(updatedFile);
      return updatedFiles;
    });
  };

  return (
    <div className="mainScreenDiv">
      <BGLogo isLoadingFiles={isLoadingFiles} />
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
      />
      <IndividualFileScreen
        file={individualFile}
        showIndividualFile={showIndividualFile}
        setShowAllFiles={setShowAllFiles}
        backToAllFileView={backToAllFileView}
        onUpdateFileTags={onUpdateFileTags}
      />
    </div>
  );
}
