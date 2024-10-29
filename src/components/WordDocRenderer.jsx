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
    <div className="wordDocRenderer">
      <div ref={containerRef} style={{ fontSize: `${16 * scale}px` }}>
        <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
      </div>
    </div>
  );
};

export default WordDocRenderer;
