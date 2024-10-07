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

  // RENDER PDF CANVAS

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [highlights, setHighlights] = useState([]); // Ensure highlights is defined here

  const canvasRef = useRef(null);
  const tagsRef = useRef(null);

  const highlightSearchWord = (textContent, viewport, context, searchWord) => {
    if (!searchWord) return; // Return if no search word

    textContent.items.forEach((item) => {
      const text = item.str;
      const index = text.toLowerCase().indexOf(searchWord.toLowerCase());

      if (index !== -1) {
        const transform = item.transform;
        const fontSize = transform[0]; // Extract font size

        // Calculate width and height for the highlight rectangle
        const width = context.measureText(searchWord).width;
        const height = fontSize;

        // Correctly calculate the x and y coordinates
        const x = transform[4] + width * (index / text.length); // Adjust for scaling
        const y = viewport.height - (transform[5] + height); // Flip y-axis for canvas

        // Draw highlight rectangle
        context.fillStyle = "rgba(238, 170, 0, .3)";
        context.fillRect(x, y, width, height);
      }
    });
  };

  const renderPDF = async () => {
    if (file.type === "application/pdf" && !isRendering) {
      setIsRendering(true);

      try {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(file.blobUrl);
        const pdf = await loadingTask.promise;

        setTotalPages(pdf.numPages);
        const page = await pdf.getPage(currentPage);

        const desiredHeight = 600;
        const viewport = page.getViewport({ scale: 1 });
        const scale = desiredHeight / viewport.height;
        const desiredWidth = viewport.width * scale;

        // Set canvas dimensions
        canvas.width = desiredWidth;
        canvas.height = desiredHeight;

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render the PDF page
        await page.render({
          canvasContext: context,
          viewport: viewport.clone({ scale }),
        }).promise;

        // Get the text content for highlighting
        const textContent = await page.getTextContent();

        // Highlight the search word
        highlightSearchWord(textContent, viewport, context, searchWord);

        // Draw highlights
        highlights.forEach((highlight) => {
          const [scaleX, , , scaleY, offsetX, offsetY] = highlight.transform;

          // Calculate highlight dimensions
          const rectWidth = highlight.text.length * scaleX * scale; // Width based on text length and scale
          const rectHeight = scaleY * scale; // Height based on scale

          const x = offsetX * scale; // X position based on scale
          const y = (offsetY - rectHeight) * scale; // Y position based on scale

          context.fillStyle = "rgba(238, 170, 0, .2)";
          context.fillRect(x, y, rectWidth, rectHeight); // Render the highlight
        });
      } catch (error) {
        console.error("Error rendering PDF:", error);
      } finally {
        setIsRendering(false);
      }
    }
  };

  const handlePageChange = (increment) => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + increment;
      if (newPage >= 1 && newPage <= totalPages) {
        return newPage; // Return new page if within bounds
      }
      return prevPage; // Stay on the current page if out of bounds
    });
  };

  useEffect(() => {
    if (showIndividualFile && file) {
      setCurrentPage(1);
      renderPDF();
    }
  }, [file, showIndividualFile]);

  useEffect(() => {
    if (showIndividualFile && file) {
      renderPDF();
    }
  }, [currentPage]);

  if (!showIndividualFile) return null;

  return (
    <div className="individualFileScreenDiv">
      <div className="fileButtonsDiv">
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
        <div className="pdfContainer">
          <canvas ref={canvasRef} style={{ width: "80%", height: "80vh" }} />
          <div>
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(-1)} // Decrement page number
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
