import React, { useState, useMemo, useEffect } from "react";

export default function FileSearchScreen({
  files,
  setResultsCount,
  showAllFiles,
  handleDeleteFile,
  openIndividualFile,
  searchWord,
  assistedSearchWords,
}) {
  const [hoveredFileId, setHoveredFileId] = useState(null);

  const filteredFilesWithText = useMemo(() => {
    const allSearchTerms = [searchWord, ...assistedSearchWords].map((word) =>
      word.toLowerCase()
    );

    return files
      .filter((file) => file.text.trim() !== "")
      .map((file) => {
        const matchedWords = allSearchTerms.filter(
          (term) =>
            file.text.toLowerCase().includes(term) ||
            file.name.toLowerCase().includes(term) ||
            (file.tags
              ? file.tags.some((tag) => tag.toLowerCase().includes(term))
              : false)
        );

        return matchedWords.length > 0 ? { ...file, matchedWords } : null;
      })
      .filter(Boolean);
  }, [files, searchWord, assistedSearchWords]);

  useEffect(() => {
    setResultsCount(filteredFilesWithText.length);
  }, [filteredFilesWithText, setResultsCount]);

  const handleMouseEnter = (fileId) => {
    setHoveredFileId(fileId);
  };

  const handleMouseLeave = () => {
    setHoveredFileId(null);
  };

  const isSearchActive = searchWord || assistedSearchWords.length > 0;

  const isPdf = (file) => file.type === "application/pdf";
  const isImage = (file) => file.type.startsWith("image/");
  const isWordDoc = (file) =>
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const [renderErrors, setRenderErrors] = useState({});

  const handleRenderError = (fileUrl) => {
    setRenderErrors((prev) => ({ ...prev, [fileUrl]: true }));
  };

  if (!showAllFiles) return null;

  return (
    <div className="fileSearchScreenDiv">
      {filteredFilesWithText.length > 0 ? (
        filteredFilesWithText.map((file) => (
          <div
            key={file.id}
            className="fileDisplayDiv"
            onMouseEnter={() => handleMouseEnter(file.id)}
            onMouseLeave={handleMouseLeave}
            onClick={() => openIndividualFile(file)}
          >
            <div className="fileDisplayTopDiv">
              {isPdf(file) ? (
                !renderErrors[file.blobUrl] ? (
                  <iframe
                    className="previewIFrame"
                    src={file.blobUrl}
                    title={file.name}
                    style={{ width: "9rem", height: "12rem" }}
                    onError={() => handleRenderError(file.blobUrl)}
                  ></iframe>
                ) : (
                  <i className="fa-regular fa-file-pdf documentIcons"></i>
                )
              ) : isImage(file) ? (
                !renderErrors[file.blobUrl] ? (
                  <img
                    className="previewImage"
                    src={file.blobUrl}
                    alt={file.name}
                    style={{ width: "9rem", height: "12rem" }}
                    onError={() => handleRenderError(file.blobUrl)}
                  />
                ) : (
                  <i className="fa-regular fa-file-image documentIcons"></i>
                )
              ) : isWordDoc(file) ? (
                <i className="fa-regular fa-file-word documentIcons"></i>
              ) : (
                <i className="fa-regular fa-file documentIcons"></i>
              )}
              <div className="deleteButtonAndMatchedWordsDiv">
                <span
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent click event from bubbling up
                    handleDeleteFile(file.id);
                  }}
                  className="fileDeleteButton"
                >
                  <i className="fa-solid fa-x fileDeleteIcon"></i>
                </span>
                <p className="matchedWords">
                  {isSearchActive && file.matchedWords.length > 0 ? (
                    <>
                      Found:{" "}
                      <span className="showMatchedWords">
                        {file.matchedWords.join(", ")}
                      </span>
                    </>
                  ) : (
                    ""
                  )}
                </p>
              </div>
            </div>
            <p className="fileName">{file.name}</p>
            {(isPdf(file) || isImage(file) || isWordDoc(file)) && (
              <button
                onClick={() => openIndividualFile(file)}
                className="viewFileButton"
              >
                {hoveredFileId === file.id ? "View File" : ""}
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="noFilesToDisplayText">No files to display</p>
      )}
    </div>
  );
}
