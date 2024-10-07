import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

export default function IndividualFileScreen({
  file,
  showIndividualFile,
  handleDeleteFile,
  backToAllFileView,
  onUpdateFileTags,
  searchWord,
}) {
  // TAGS LOGIC
  const [newTag, setNewTag] = useState("");
  const [showTags, setShowTags] = useState(false);

  // PDF RENDERING LOGIC
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [scale, setScale] = useState(1.5);
  const [fileId, setFileId] = useState(null);
  const [renderTask, setRenderTask] = useState(null);

  const canvasRef = useRef(null);
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

  const highlightSearchWord = (page, viewport, context, currentScale) => {
    if (!searchWord || !file.locations) return;

    const lowerSearchWord = searchWord.toLowerCase();
    const pageLocations = file.locations.filter(
      (loc) => loc.page === currentPage
    );

    pageLocations.forEach((location) => {
      const text = location.text.toLowerCase();
      if (text.includes(lowerSearchWord)) {
        const index = text.indexOf(lowerSearchWord);
        const highlightWidth =
          (location.width / location.text.length) * searchWord.length;
        const highlightX = location.x;

        const highlightY = location.y - location.height * 1;
        const highlightHeight = location.height * 1.6;

        context.fillStyle = "rgba(255, 255, 0, 0.3)";
        context.fillRect(
          highlightX * currentScale,
          highlightY * currentScale,
          highlightWidth * currentScale,
          highlightHeight * currentScale
        );
      }
    });
  };

  const renderPage = async (pageNum, currentScale = scale) => {
    if (!pdfDocument) return;

    // Cancel any ongoing render task
    if (renderTask) {
      renderTask.cancel();
    }

    try {
      const page = await pdfDocument.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const viewport = page.getViewport({ scale: currentScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const newRenderTask = page.render({
        canvasContext: context,
        viewport: viewport,
      });

      setRenderTask(newRenderTask);

      await newRenderTask.promise;

      // Only highlight if the render task wasn't cancelled
      if (!newRenderTask.isCancelled) {
        highlightSearchWord(page, viewport, context, currentScale);
      }
    } catch (error) {
      if (error.name !== "RenderingCancelledException") {
        console.error("Error rendering PDF:", error);
      }
    } finally {
      setRenderTask(null);
    }
  };

  const handlePageChange = (increment) => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + increment;
      return newPage > 0 && newPage <= totalPages ? newPage : prevPage;
    });
  };

  const handleZoom = (zoomIn) => {
    setScale((prevScale) => {
      const newScale = zoomIn ? prevScale * 1.2 : prevScale / 1.2;
      const clampedScale = Math.max(0.5, Math.min(newScale, 3));

      // Render the page with the new scale
      renderPage(currentPage, clampedScale);

      return clampedScale;
    });
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
      if (file.id !== fileId) {
        setCurrentPage(1);
        setFileId(file.id);
      }

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
  }, [file, showIndividualFile, fileId]);

  useEffect(() => {
    if (pdfDocument) {
      renderPage(currentPage, scale);
    }
  }, [currentPage, pdfDocument, searchWord]);

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
          Matched Words: {file.matchedWords.join(", ")}
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
        <div
          className="pdfContainer"
          style={{
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            overflow: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <button onClick={() => handleZoom(false)}>Zoom Out</button>
              <button onClick={() => handleZoom(true)}>Zoom In</button>
            </div>
            <div
              style={{
                maxWidth: "100%",
                maxHeight: "calc(80vh - 100px)",
                overflow: "auto",
                border: "1px solid #ccc",
              }}
            >
              <canvas ref={canvasRef} style={{ display: "block" }} />
            </div>
            <div style={{ marginTop: "10px" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(-1)}
              >
                Previous
              </button>
              <span>{`Page ${currentPage} of ${totalPages}`}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
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
        </div>
      ) : (
        <p>Unsupported file type</p>
      )}
    </div>
  );
}
