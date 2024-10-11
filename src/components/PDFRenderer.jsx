import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

export default function PDFRenderer({
  file,
  searchWord,
  assistedSearchWords,
  showIndividualFile,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [scale, setScale] = useState(1.5);
  const [fileId, setFileId] = useState(null);
  const [renderTask, setRenderTask] = useState(null);

  const canvasRef = useRef(null);

  const highlightMatchedWords = (page, viewport, context, currentScale) => {
    if (!file.locations) return;

    const searchTerms = [searchWord, ...assistedSearchWords]
      .filter(Boolean)
      .map((term) => term.toLowerCase());

    const pageLocations = file.locations.filter(
      (loc) => loc.page === currentPage
    );

    pageLocations.forEach((location) => {
      const text = location.text.toLowerCase();
      searchTerms.forEach((term) => {
        if (text.includes(term)) {
          const index = text.indexOf(term);
          const highlightWidth =
            (location.width / location.text.length) * term.length;
          const highlightX =
            location.x + (location.width / location.text.length) * index;

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
    });
  };

  const renderPage = async (pageNum, currentScale = scale) => {
    if (!pdfDocument) return;

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

      if (!newRenderTask.isCancelled) {
        highlightMatchedWords(page, viewport, context, currentScale);
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

      renderPage(currentPage, clampedScale);

      return clampedScale;
    });
  };

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
  }, [currentPage, pdfDocument, searchWord, assistedSearchWords]);

  return (
    <div className="pdfContainerDiv">
      <div style={{ marginBottom: "10px" }}>
        <button className="zoomButton" onClick={() => handleZoom(false)}>
          <i className="fa-solid fa-magnifying-glass-minus zoomButtonIcon"></i>
        </button>
        <button className="zoomButton" onClick={() => handleZoom(true)}>
          <i className="fa-solid fa-magnifying-glass-plus zoomButtonIcon"></i>
        </button>
      </div>
      <div className="pdfDiv">
        <div
          className="pdfCanvas"
          style={{
            maxWidth: "100%",
            maxHeight: "calc(80vh - 100px)",
            overflow: "auto",
            border: "1px solid #ccc",
          }}
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>
      </div>
      <div className="nextAndPreviousButtonsDiv">
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
    </div>
  );
}
