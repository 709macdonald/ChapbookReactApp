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
    img.src = file.fileUrl;

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
    // Check if file.locations exists AND is an array
    if (!file.locations || !Array.isArray(file.locations)) {
      console.log(
        "No searchable locations found in this file or locations is not an array"
      );
      return;
    }

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
    <div className="imageContainer">
      <div ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
