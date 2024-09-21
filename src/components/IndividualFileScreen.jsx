import React, { useState } from "react";

export default function IndividualFileScreen({
  file,
  showIndividualFile,
  backToAllFileView,
  onUpdateFileTags,
}) {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    onUpdateFileTags((prevFiles) =>
      prevFiles.map((f) => {
        if (f.id === file.id) {
          return {
            ...f,
            tags: [...(f.tags || []), newTag],
          };
        }
        return f;
      })
    );
    setNewTag("");
  };

  const handleRemoveTag = (index) => {
    onUpdateFileTags((prevFiles) =>
      prevFiles.map((f) => {
        if (f.url === file.url) {
          return {
            ...f,
            tags: (f.tags || []).filter((_, i) => i !== index),
          };
        }
        return f;
      })
    );
  };

  if (!showIndividualFile) return null;
  return (
    <div className="individualFileScreenDiv">
      <button onClick={backToAllFileView} className="backButton">
        Back
      </button>
      <div className="fileDetails">
        <h3>{file.name}</h3>
        <p>Date Created: {new Date(file.date).toLocaleDateString()}</p>
        <p>Word Count: {file.text.split(/\s+/).length}</p>
      </div>
      <iframe
        src={file.blobUrl}
        title={file.name}
        style={{ width: "100%", height: "80vh" }}
      ></iframe>
      <div className="tagsSection">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a tag"
        />
        <button onClick={handleAddTag}>Add Tag</button>
        <div className="tagsList">
          {(file.tags || []).map((tag, index) => (
            <div key={index}>
              {tag} <button onClick={() => handleRemoveTag(index)}>x</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
