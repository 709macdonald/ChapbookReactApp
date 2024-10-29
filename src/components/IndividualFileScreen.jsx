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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [showTags, setShowTags] = useState(false);
  const [showFileDetails, setShowFileDetails] = useState(true);

  const tagsRef = useRef(null);

  const matchedWords = useMemo(() => {
    if (!file) return [];

    const allSearchTerms = [searchWord, ...assistedSearchWords]
      .filter(Boolean)
      .map((word) => word.toLowerCase());

    return allSearchTerms.filter(
      (term) =>
        file.text?.toLowerCase().includes(term) ||
        file.name.toLowerCase().includes(term) ||
        (file.tags
          ? file.tags.some((tag) => tag.toLowerCase().includes(term))
          : false)
    );
  }, [file, searchWord, assistedSearchWords]);

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    onUpdateFileTags((prevFiles) =>
      prevFiles.map((f) => {
        if (f.id === file.id) {
          const updatedTags = [...(f.tags || [])];
          if (!updatedTags.includes(newTag.trim())) {
            updatedTags.push(newTag.trim());
          }
          return { ...f, tags: updatedTags };
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
          const updatedTags = [...(f.tags || [])];
          updatedTags.splice(index, 1);
          return { ...f, tags: updatedTags };
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

  useEffect(() => {
    if (showIndividualFile && file && file.type === "application/pdf") {
      pdfjsLib
        .getDocument(file.blobUrl)
        .promise.then((pdf) => {
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
        })
        .catch((error) => {
          console.error("Error loading PDF:", error);
        });
    }
  }, [file, showIndividualFile]);

  const handlePageChange = (increment) => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + increment;
      return newPage > 0 && newPage <= totalPages ? newPage : prevPage;
    });
  };

  const handleZoom = (zoomIn) => {
    setScale((prevScale) => {
      const newScale = zoomIn ? prevScale * 1.2 : prevScale / 1.2;
      return Math.max(0.5, Math.min(newScale, 3));
    });
  };

  if (!showIndividualFile || !file) return null;

  return (
    <div className="individualFileScreenDiv">
      <div className="individualFileScreenTopDiv">
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
        <h3
          onClick={() => setShowFileDetails(!showFileDetails)}
          className="individualFileName"
          style={{ cursor: "pointer" }}
        >
          {file.name}
        </h3>
        <hr />
        {showFileDetails && (
          <div className="fileDetailsDiv">
            <p className="fileDetail">
              Date Created: {new Date(file.date).toLocaleDateString()}
            </p>
            <p className="fileDetail">
              Word Count: {file.text?.split(/\s+/).length || 0}
            </p>
            <p className="fileDetail">
              Matched Words:{" "}
              {matchedWords.length > 0 ? matchedWords.join(", ") : "None"}
            </p>
            <div className="tagsInputDiv" ref={tagsRef}>
              <div className="tooltip-wrapper">
                <span className="tooltip">
                  {showTags ? "Hide tags list" : "Show tags list"}
                </span>
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
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="addATagBar"
                onKeyDown={handleKeyDown}
              />
              <button
                className="addTagButton"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add Tag
              </button>

              {showTags && (
                <div className="tagsList">
                  {(file.tags || []).map((tag, index) => (
                    <div key={index} className="tag">
                      <button
                        className="tagDeleteButton"
                        onClick={() => handleRemoveTag(index)}
                      >
                        x
                      </button>
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="zoomButtonsDiv">
        <button className="zoomButton" onClick={() => handleZoom(false)}>
          <i className="fa-solid fa-magnifying-glass-minus zoomButtonIcon"></i>
        </button>
        <button className="zoomButton" onClick={() => handleZoom(true)}>
          <i className="fa-solid fa-magnifying-glass-plus zoomButtonIcon"></i>
        </button>
      </div>
      {file.type === "application/pdf" ? (
        <PDFRenderer
          file={file}
          pdfDocument={pdfDocument}
          currentPage={currentPage}
          scale={scale}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : file.type.startsWith("image/") ? (
        <ImageRenderer
          file={file}
          scale={scale}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
        <WordDocRenderer
          file={file}
          scale={scale}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : (
        <p>Unsupported file type</p>
      )}
      {file.type === "application/pdf" && (
        <div className="pageControlsDiv">
          <button
            className="previousPageButton"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(-1)}
          >
            Previous
          </button>
          <span>{` Page ${currentPage} of ${totalPages} `}</span>
          <button
            className="nextPageButton"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
