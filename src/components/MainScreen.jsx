import React, { useState } from "react";
import LoadingGear from "./LoadingGear";
import FileSearchScreen from "./FileSearchScreen";
import IndividualFileScreen from "./IndividualFileScreen";

export default function MainScreen({
  files,
  setFiles,
  isLoadingFiles,
  showAllFiles,
  setShowAllFiles,
  showIndividualFile,
  setShowIndividualFile,
  handleDeleteFile,
  searchWord,
  suggestions,
}) {
  const [indvidualFile, setIndividualFile] = useState(null);

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
      <div className="bgLogoDiv">
        <h2 className="chap">
          Chap<span className="book">book</span>
        </h2>
      </div>
      <LoadingGear isLoadingFiles={isLoadingFiles} />
      <FileSearchScreen
        files={files}
        showAllFiles={showAllFiles}
        setShowIndividualFile={setShowIndividualFile}
        handleDeleteFile={handleDeleteFile}
        openIndividualFile={openIndividualFile}
        searchWord={searchWord}
        suggestions={suggestions}
      />
      <IndividualFileScreen
        file={indvidualFile}
        showIndividualFile={showIndividualFile}
        setShowAllFiles={setShowAllFiles}
        backToAllFileView={backToAllFileView}
        onUpdateFileTags={onUpdateFileTags}
      />
    </div>
  );
}
