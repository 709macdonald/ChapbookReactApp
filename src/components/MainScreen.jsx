import React, { useState } from "react";
import LoadingGear from "./LoadingGear";
import AllFilesScreen from "./AllFilesScreen";
import IndividualFileScreen from "./IndividualFileScreen";

export default function MainScreen({
  files,
  isLoadingFiles,
  showAllFiles,
  setShowAllFiles,
  showIndividualFile,
  setShowIndividualFile,
  handleDeleteFile,
}) {
  const [indvidualFile, setIndividualFile] = useState(null);

  const openIndividualFile = (file) => {
    setIndividualFile(file);
    setShowAllFiles(false);
    setShowIndividualFile(true);
  };

  return (
    <div className="mainScreenDiv">
      <div className="bgLogoDiv">
        <h2 className="chap">
          Chap<span className="book">book</span>
        </h2>
      </div>
      <LoadingGear isLoadingFiles={isLoadingFiles} />
      <AllFilesScreen
        files={files}
        showAllFiles={showAllFiles}
        setShowIndividualFile={setShowIndividualFile}
        handleDeleteFile={handleDeleteFile}
        openIndividualFile={openIndividualFile}
      />
      <IndividualFileScreen
        files={files}
        showIndividualFile={showIndividualFile}
        setShowAllFiles={setShowAllFiles}
      />
    </div>
  );
}
