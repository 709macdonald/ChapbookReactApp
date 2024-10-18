import React, { useRef, useEffect, useState } from "react";

export default function ImageRenderer({
  file,
  scale,
  searchWord,
  assistedSearchWords,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = file.blobUrl;

    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      updateCanvasSize(img.width, img.height);
      drawImage(ctx, img);
      highlightSearchWords(ctx);
    };
  }, [file, scale, searchWord, assistedSearchWords]);

  const updateCanvasSize = (imgWidth, imgHeight) => {
    const canvas = canvasRef.current;
    canvas.width = imgWidth * scale;
    canvas.height = imgHeight * scale;
  };

  const drawImage = (ctx, img) => {
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const highlightSearchWords = (ctx) => {
    if (!file.locations) return;

    const searchTerms = [searchWord, ...assistedSearchWords]
      .filter(Boolean)
      .map((term) => term.toLowerCase());

    file.locations.forEach((location) => {
      const text = location.text.toLowerCase();
      searchTerms.forEach((term) => {
        if (text.includes(term)) {
          ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
          ctx.fillRect(
            location.x * scale,
            location.y * scale,
            location.width * scale,
            location.height * scale
          );
        }
      });
    });
  };

  return (
    <div
      className="imageContainer"
      style={{ display: "flex", flexDirection: "column", overflow: "auto" }}
    >
      <div
        ref={containerRef}
        style={{
          maxHeight: "calc(80vh - 40px)",
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          border: "1px solid #ccc",
        }}
      >
        <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
      </div>
    </div>
  );
}
