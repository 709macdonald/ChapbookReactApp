import React, { useState, useEffect, useRef, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PDFRenderer from "./PDFRenderer";
import ImageRenderer from "./ImageRenderer";
import WordDocRenderer from "./WordDocRenderer";
import { normalizeFileData } from "../assets/utils/fileUtils";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  import.meta.env.BASE_URL + "pdf.worker.mjs";

export default function IndividualFileScreen({
  file,
  showIndividualFile,
  handleDeleteFile,
  backToAllFileView,
  onUpdateFileTags,
  searchWord,
  assistedSearchWords,
}) {
  // Normalize file data to ensure consistent structure
  const normalizedFile = useMemo(() => normalizeFileData(file), [file]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [showTags, setShowTags] = useState(false);
  const [showFileDetails, setShowFileDetails] = useState(true);

  const tagsRef = useRef(null);

  const matchedWords = useMemo(() => {
    if (!normalizedFile) return [];

    const allSearchTerms = [searchWord, ...assistedSearchWords]
      .filter(Boolean)
      .map((word) => word.toLowerCase());

    return allSearchTerms.filter(
      (term) =>
        normalizedFile.text?.toLowerCase().includes(term) ||
        normalizedFile.name.toLowerCase().includes(term) ||
        (normalizedFile.tags
          ? normalizedFile.tags.some((tag) => tag.toLowerCase().includes(term))
          : false)
    );
  }, [normalizedFile, searchWord, assistedSearchWords]);

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    onUpdateFileTags((prevFiles) =>
      prevFiles.map((f) => {
        if (f.id === normalizedFile.id) {
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
        if (f.id === normalizedFile.id) {
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
    if (
      showIndividualFile &&
      normalizedFile &&
      normalizedFile.type === "application/pdf"
    ) {
      pdfjsLib
        .getDocument(normalizedFile.fileUrl)
        .promise.then((pdf) => {
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
        })
        .catch((error) => {
          console.error("Error loading PDF:", error);
        });
    }
  }, [normalizedFile, showIndividualFile]);

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

  if (!showIndividualFile || !normalizedFile) return null;

  return (
    <div className="individualFileScreenDiv">
      <div className="individualFileScreenTopDiv">
        <div className="fileButtonsDiv">
          <button onClick={backToAllFileView} className="backButton">
            <i className="fa-solid fa-left-long backButtonIcon"></i>
            Back
          </button>
          <button
            onClick={() => handleDeleteFile(normalizedFile.id)}
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
          {normalizedFile.name}
        </h3>
        <hr />
        {showFileDetails && (
          <div className="fileDetailsDiv">
            <p className="fileDetail">
              Date Created: {new Date(normalizedFile.date).toLocaleDateString()}
            </p>
            <p className="fileDetail">
              Word Count: {normalizedFile.text?.split(/\s+/).length || 0}
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
              <div className="tooltip-wrapper">
                <span className="tooltip">Add Tag</span>
                <button
                  className="addTagButton"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <i className="fa-solid fa-plus"></i>{" "}
                </button>
              </div>

              {showTags && (
                <div className="tagsList">
                  {(normalizedFile.tags || []).map((tag, index) => (
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
      {normalizedFile.type === "application/pdf" ? (
        <PDFRenderer
          file={normalizedFile}
          pdfDocument={pdfDocument}
          currentPage={currentPage}
          scale={scale}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : normalizedFile.type.startsWith("image/") ? (
        <ImageRenderer
          file={normalizedFile}
          scale={scale}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : normalizedFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
        <WordDocRenderer
          file={normalizedFile}
          scale={scale}
          searchWord={searchWord}
          assistedSearchWords={assistedSearchWords}
        />
      ) : (
        <p>Unsupported file type</p>
      )}
      {normalizedFile.type === "application/pdf" && (
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
