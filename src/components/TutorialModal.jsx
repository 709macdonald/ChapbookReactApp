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
          <li>
            📂 <strong>Upload files</strong> — PDFs, Word documents, and images
            (like scanned notes, receipts, or forms).
          </li>
          <li>
            🔍 <strong>Search instantly</strong> across all your documents —
            even handwritten or scanned content.
          </li>
          <li>
            💡 <strong>Use Assisted Search</strong> to uncover related terms and
            smarter suggestions.
          </li>
          <li>
            📌 <strong>See highlights</strong> showing exactly where your
            keywords appear inside each file.
          </li>
          <li>
            ✍️ <strong>Generate content</strong> with the AI Writing button —
            create summaries, brainstorm ideas, or rewrite text.
          </li>
          <li>
            🏷️ <strong>Add tags</strong> to organize your files and make them
            easy to find later.
          </li>
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
