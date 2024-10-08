import React, { useRef, useEffect, useState } from "react";

export default function ImageRenderer({ file, searchWord }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
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
      highlightSearchWord(ctx);
    };
  }, [file, scale, searchWord]);

  const updateCanvasSize = (imgWidth, imgHeight) => {
    const canvas = canvasRef.current;
    canvas.width = imgWidth * scale;
    canvas.height = imgHeight * scale;
  };

  const drawImage = (ctx, img) => {
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const highlightSearchWord = (ctx) => {
    if (!searchWord || !file.locations) return;

    const lowerSearchWord = searchWord.toLowerCase();

    file.locations.forEach((location) => {
      const text = location.text.toLowerCase();
      if (text.includes(lowerSearchWord)) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
        ctx.fillRect(
          location.x * scale,
          location.y * scale,
          location.width * scale,
          location.height * scale
        );
      }
    });
  };

  const handleZoom = (zoomIn) => {
    setScale((prevScale) => {
      const newScale = zoomIn ? prevScale * 1.2 : prevScale / 1.2;
      updateCanvasSize(originalDimensions.width, originalDimensions.height);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = file.blobUrl;
      img.onload = () => {
        drawImage(ctx, img);
        highlightSearchWord(ctx);
      };
      return newScale;
    });
  };

  return (
    <div
      className="imageContainer"
      style={{ height: "80vh", display: "flex", flexDirection: "column" }}
    >
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => handleZoom(false)}>Zoom Out</button>
        <button onClick={() => handleZoom(true)}>Zoom In</button>
      </div>
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
