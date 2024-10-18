import React, { useState, useEffect, useRef } from "react";

const WordDocRenderer = ({ file, scale, searchWord, assistedSearchWords }) => {
  const [highlightedText, setHighlightedText] = useState("");
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

  return (
    <div
      className="wordDocRenderer"
      style={{ display: "flex", flexDirection: "column", overflow: "auto" }}
    >
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          border: "1px solid #ccc",
          padding: "20px",
          fontSize: `${16 * scale}px`,
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
