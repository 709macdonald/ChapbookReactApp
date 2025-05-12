import React, { useState, useMemo, useEffect } from "react";

export default function FileSearchScreen({
  files,
  setResultsCount,
  showAllFiles,
  handleDeleteFile,
  openIndividualFile,
  searchWord,
  assistedSearchWords,
  sortCriteria,
}) {
  const [hoveredFileId, setHoveredFileId] = useState(null);
  const [renderErrors, setRenderErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 12;

  const sortedFiles = useMemo(() => {
    const sorted = [...files].sort((a, b) => {
      let comparison = 0;

      if (sortCriteria === "nameA-Z") {
        comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      } else if (sortCriteria === "nameZ-A") {
        comparison = b.name.toLowerCase().localeCompare(a.name.toLowerCase());
      } else if (sortCriteria === "dateOldNew") {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortCriteria === "dateNewOld") {
        comparison = new Date(b.date) - new Date(a.date);
      } else if (sortCriteria === "wordCount") {
        const wordCountA = a.text ? a.text.split(" ").length : 0;
        const wordCountB = b.text ? b.text.split(" ").length : 0;
        comparison = wordCountA - wordCountB;
      }

      return comparison;
    });
    return sorted;
  }, [files, sortCriteria]);

  const filteredFilesWithText = useMemo(() => {
    const allSearchTerms = [searchWord, ...assistedSearchWords].map((word) =>
      word.toLowerCase()
    );
    return sortedFiles
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
  }, [files, searchWord, assistedSearchWords, sortedFiles]);

  useEffect(() => {
    setResultsCount(filteredFilesWithText.length);
    setCurrentPage(1); // reset to page 1 when results change
  }, [filteredFilesWithText, setResultsCount]);

  const totalPages = Math.ceil(filteredFilesWithText.length / resultsPerPage);

  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    return filteredFilesWithText.slice(startIndex, startIndex + resultsPerPage);
  }, [filteredFilesWithText, currentPage]);

  const isSearchActive = searchWord || assistedSearchWords.length > 0;

  const isPdf = (file) => file.type === "application/pdf";
  const isImage = (file) => file.type.startsWith("image/");
  const isWordDoc = (file) =>
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const handleMouseEnter = (fileId) => {
    setHoveredFileId(fileId);
  };

  const handleMouseLeave = () => {
    setHoveredFileId(null);
  };

  const handleRenderError = (fileUrl) => {
    setRenderErrors((prev) => ({ ...prev, [fileUrl]: true }));
  };

  if (!showAllFiles) return null;

  return (
    <div className="fileSearchWrapper">
      <div className="fileSearchScreenDiv">
        {paginatedFiles.length > 0 ? (
          paginatedFiles.map((file) => (
            <div
              key={file.id}
              className="fileDisplayDiv"
              onMouseEnter={() => handleMouseEnter(file.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => openIndividualFile(file)}
            >
              <div className="fileDisplayTopDiv">
                {isPdf(file) ? (
                  !renderErrors[file.fileUrl] ? (
                    <iframe
                      className="previewIFrame"
                      src={file.fileUrl}
                      title={file.name}
                      style={{ width: "9rem", height: "12rem" }}
                      onError={() => handleRenderError(file.fileUrl)}
                    ></iframe>
                  ) : (
                    <i className="fa-regular fa-file-pdf documentIcons"></i>
                  )
                ) : isImage(file) ? (
                  !renderErrors[file.fileUrl] ? (
                    <img
                      className="previewImage"
                      src={file.fileUrl}
                      alt={file.name}
                      style={{ width: "9rem", height: "12rem" }}
                      onError={() => handleRenderError(file.fileUrl)}
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
                      event.stopPropagation();
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
          <div>No files found.</div>
        )}
      </div>

      {/* Pagination sits here, outside the scrolling grid */}
      <div className="paginationControls">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
