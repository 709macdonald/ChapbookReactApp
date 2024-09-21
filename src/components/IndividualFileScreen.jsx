import React from "react";

export default function IndividualFileScreen({
  files,
  showIndividualFile,
  setShowAllFiles,
}) {
  if (!showIndividualFile) return null;
  return (
    <div className="fileViewContainer">
      <button onClick={onBack} className="backButton">
        Back
      </button>
      <div className="fileDetails">
        <h3>{file.name}</h3>
        <p>
          Date Created:{" "}
          {new Date(file.fileObject.lastModifiedDate).toLocaleDateString()}
        </p>
        <p>Word Count: {file.text.split(/\s+/).length}</p>
      </div>
      <iframe
        src={file.url}
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
