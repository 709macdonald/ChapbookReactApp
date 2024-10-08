import React, { useState, useEffect, useRef, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PDFRenderer from "./PDFRenderer";
import ImageRenderer from "./ImageRenderer";
import WordDocRenderer from "./WordDocRenderer";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

export default function IndividualFileScreen({
  file,
  showIndividualFile,
  handleDeleteFile,
  backToAllFileView,
  onUpdateFileTags,
  searchWord,
  assistedSearchWords,
}) {
  // MATCHED WORDS LOGIC

  const matchedWords = useMemo(() => {
    if (!file) return [];

    const allSearchTerms = [searchWord, ...assistedSearchWords].map((word) =>
      word.toLowerCase()
    );

    return allSearchTerms.filter(
      (term) =>
        file.text.toLowerCase().includes(term) ||
        file.name.toLowerCase().includes(term) ||
        (file.tags
          ? file.tags.some((tag) => tag.toLowerCase().includes(term))
          : false)
    );
  }, [file, searchWord, assistedSearchWords]);

  // TAGS LOGIC
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

  if (!showIndividualFile || !file) return null;

  return (
    <div className="individualFileScreenDiv">
      <div className="fileButtonsDiv">
        <button onClick={backToAllFileView} className="backButton">
          <i className="fa-solid fa-left-long backButtonIcon"></i>
          Back
        </button>
        <button
          onClick={() => handleDeleteFile(file.id)}
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
        <p className="fileDetail">
          Matched Words:{" "}
          {matchedWords.length > 0 ? matchedWords.join(", ") : "None"}
        </p>
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
      {file.type === "application/pdf" ? (
        <PDFRenderer
          file={file}
          showIndividualFile={showIndividualFile}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : file.type.startsWith("image/") ? (
        <ImageRenderer
          file={file}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
        <WordDocRenderer
          file={file}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : (
        <p>Unsupported file type</p>
      )}
    </div>
  );
}
