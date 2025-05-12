import React, { useState } from "react";

export default function TutorialModal({ setShowTutorial }) {
  const [neverShow, setNeverShow] = useState(() => {
    const stored = localStorage.getItem("tutorialView");
    return stored === "false";
  });

  const handleClose = () => {
    setShowTutorial(false);
  };

  const handleShowOnLoad = (checked) => {
    setNeverShow(checked);
    localStorage.setItem("tutorialView", checked ? "false" : "true");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Welcome to CHAPBOOK!</h2>
        <p>Here's how to get started:</p>
        <ol>
          <li>📂 Upload documents (PDF, Word, images).</li>
          <li>🔍 Search for keywords across all uploaded files.</li>
          <li>💡 Use Assisted Search for related terms.</li>
          <li>📑 Review highlighted results in documents.</li>
          <li>🏷️ Tag files for easier future access.</li>
        </ol>

        <label
          style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}
        >
          <input
            type="checkbox"
            checked={neverShow}
            onChange={(e) => handleShowOnLoad(e.target.checked)}
            style={{ marginRight: "0.5rem" }}
          />
          Never show again
        </label>

        <button onClick={handleClose} style={{ marginTop: "1rem" }}>
          Exit Tutorial!
        </button>
      </div>
    </div>
  );
}
