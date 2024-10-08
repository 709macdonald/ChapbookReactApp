import React, { useState, useEffect, useRef } from "react";

const WordDocRenderer = ({ file, searchWord, assistedSearchWords }) => {
  const [highlightedText, setHighlightedText] = useState("");
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!file || !file.text) {
      setHighlightedText("");
      return;
    }

    const allSearchTerms = [searchWord, ...assistedSearchWords].filter(Boolean);

    if (allSearchTerms.length === 0) {
      setHighlightedText(file.text);
      return;
    }

    const regex = new RegExp(`(${allSearchTerms.join("|")})`, "gi");
    const highlighted = file.text.replace(regex, "<mark>$1</mark>");
    setHighlightedText(highlighted);
  }, [file, searchWord, assistedSearchWords]);

  const handleZoom = (increment) => {
    setZoom((prevZoom) => {
      const newZoom = prevZoom + increment;
      return Math.max(0.5, Math.min(newZoom, 2)); // Limit zoom between 0.5x and 2x
    });
  };

  return (
    <div
      className="wordDocRenderer"
      style={{ height: "80vh", display: "flex", flexDirection: "column" }}
    >
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => handleZoom(-0.1)}>Zoom Out</button>
        <span style={{ margin: "0 10px" }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => handleZoom(0.1)}>Zoom In</button>
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          border: "1px solid #ccc",
          padding: "20px",
          fontSize: `${16 * zoom}px`,
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
      </div>
    </div>
  );
};

export default WordDocRenderer;
