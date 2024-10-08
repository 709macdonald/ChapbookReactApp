import React, { useRef, useEffect, useState } from "react";

export default function ImageRenderer({ file, searchWord }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = file.blobUrl;

    img.onload = () => {
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      highlightSearchWord(ctx);
    };
  }, [file, scale, searchWord]);

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
    setScale((prevScale) => (zoomIn ? prevScale * 1.2 : prevScale / 1.2));
  };

  return (
    <div className="imageContainer">
      <div>
        <button onClick={() => handleZoom(false)}>Zoom Out</button>
        <button onClick={() => handleZoom(true)}>Zoom In</button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
