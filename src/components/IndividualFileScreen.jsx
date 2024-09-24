import React, { useState, useEffect, useRef } from "react";

export default function IndividualFileScreen({
  file,
  showIndividualFile,
  handleDeleteFile,
  backToAllFileView,
  onUpdateFileTags,
}) {
  const [newTag, setNewTag] = useState("");
  const [showTags, setShowTags] = useState(false);
  const tagsRef = useRef(null);

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
    setShowTags(true);
  };

  const handleRemoveTag = (index) => {
    onUpdateFileTags((prevFiles) =>
      prevFiles.map((f) => {
        if (f.id === file.id) {
          return {
            ...f,
            tags: (f.tags || []).filter((_, i) => i !== index),
          };
        }
        return f;
      })
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTag();
    }
  };

  /* CLOSE TAGS LIST WITH CLICK */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagsRef.current && !tagsRef.current.contains(event.target)) {
        setShowTags(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!showIndividualFile) return null;

  return (
    <div className="individualFileScreenDiv">
      <div div className="fileButtonsDiv">
        <button onClick={backToAllFileView} className="backButton">
          <i className="fa-solid fa-left-long backButtonIcon"></i>
          Back
        </button>
        <button
          onClick={() => handleDeleteFile(file.id)} // Call the delete function with the file ID
          className="individualDeleteFileButton"
        >
          Delete File
        </button>
      </div>
      <h3 className="individualFileName">{file.name}</h3>
      <div className="fileDetailsDiv">
        <p className="fileDetail">
          Date Created: {new Date(file.date).toLocaleDateString()}
        </p>
        <p className="fileDetail">
          Word Count: {file.text.split(/\s+/).length}
        </p>
        <p className="fileDetail">Matched Words: {file.matchedWords}</p>
        <div className="tagsInputDiv" ref={tagsRef}>
          <button
            className="toggleTagView"
            onClick={() => setShowTags(!showTags)}
          >
            <i
              className={`fa-solid tagDisplayArrow ${
                showTags ? "fa-angle-up" : "fa-angle-down"
              }`}
            ></i>
          </button>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="addATagBar"
            onKeyDown={handleKeyDown}
          />
          <button className="addTagButton" onClick={handleAddTag}>
            Add Tag
          </button>

          {showTags && (
            <div className="tagsList">
              {(file.tags || []).map((tag, index) => (
                <div key={index}>
                  <button
                    className="tagDeleteButton"
                    onClick={() => handleRemoveTag(index)}
                  >
                    x
                  </button>
                  {tag}{" "}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conditional Rendering for PDF, Image, and Word documents */}
      {file.type === "application/pdf" ? (
        <iframe
          src={file.blobUrl}
          title={file.name}
          style={{ width: "100%", height: "80vh" }}
        ></iframe>
      ) : file.type.startsWith("image/") ? (
        <img
          src={file.blobUrl}
          alt={file.name}
          style={{ width: "100%", height: "80vh" }}
        />
      ) : file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
        <div className="wordDocPreview">
          <h4>Document Preview</h4>
          <p>{file.text}</p>{" "}
          {/* Displaying the text content of the Word document */}
        </div>
      ) : (
        <p>Unsupported file type</p>
      )}
    </div>
  );
}
