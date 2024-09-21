import React from "react";

export default function AllFilesScreen({
  files,
  showAllFiles,
  setShowIndividualFile,
}) {
  setShowIndividualFile(false);

  if (!showAllFiles) return null;
  return <div>AllFilesScreen</div>;
}
