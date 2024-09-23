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
        <i class="fa-solid fa-left-long backArrow"></i>
        Back
      </button>
      <h3 className="individualFileName">{file.name}</h3>
      <div className="fileDetailsDiv">
        <p className="fileDetail">
          Date Created: {new Date(file.date).toLocaleDateString()}
        </p>
        <p className="fileDetail">
          Word Count: {file.text.split(/\s+/).length}
        </p>
        <p className="fileDetail">Matched Words: {file.matchedWords}</p>
        <div className="tagsInputDiv">
          <i class="fa-solid fa-angle-down"></i>
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
      <iframe
        src={file.blobUrl}
        title={file.name}
        style={{ width: "100%", height: "80vh" }}
      ></iframe>
    </div>
  );
}
