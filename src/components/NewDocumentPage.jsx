import React from "react";

export default function NewDocumentPage({
  newDocumentPage,
  setNewDocumentPage,
  setShowAllFiles,
  setBgLogoOn,
}) {
  const backToAllFileView = () => {
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
  };

  if (!newDocumentPage) return null;
  return (
    <div>
      <button onClick={backToAllFileView}>Back</button>
      NewDocumentPage
    </div>
  );
}
