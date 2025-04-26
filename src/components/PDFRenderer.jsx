import React, { useEffect, useRef, useState } from "react";

export default function PDFRenderer({
  file,
  pdfDocument,
  currentPage,
  scale,
  searchWord,
  assistedSearchWords,
}) {
  const [renderTask, setRenderTask] = useState(null);
  const canvasRef = useRef(null);

  const highlightMatchedWords = (page, viewport, context, currentScale) => {
    if (!file.locations || !Array.isArray(file.locations)) {
      console.log(
        "No searchable locations found in this file or locations is not an array"
      );
      return;
    }

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

  useEffect(() => {
    if (pdfDocument) {
      renderPage(currentPage, scale);
    }
  }, [currentPage, pdfDocument, scale, searchWord, assistedSearchWords]);

  return (
    <div className="pdfDiv">
      <div className="pdfCanvas">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
