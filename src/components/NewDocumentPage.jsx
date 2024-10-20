import React, { useState } from "react";
import { Editor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";

export default function NewDocumentPage({
  newDocumentPage,
  setNewDocumentPage,
  setShowAllFiles,
  setBgLogoOn,
}) {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const backToAllFileView = () => {
    setBgLogoOn(true);
    setShowAllFiles(true);
    setNewDocumentPage(false);
  };

  if (!newDocumentPage) return null;

  return (
    <div>
      <button onClick={backToAllFileView}>Back</button>
      <h1>New Document</h1>
      <div
        style={{
          border: "1px solid #ccc",
          minHeight: "300px",
          padding: "10px",
        }}
      >
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          placeholder="Start typing your document..."
        />
      </div>
    </div>
  );
}
