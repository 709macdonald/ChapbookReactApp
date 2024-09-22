import React, { useState, useMemo } from "react";

export default function FileSearchScreen({
  files,
  showAllFiles,
  handleDeleteFile,
  openIndividualFile,
  searchWord,
  assistedSearchWords,
}) {
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
      .filter(Boolean); // Remove any null results (files with no matches)
  }, [files, searchWord, assistedSearchWords]);

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
    <div className="fileList">
      {filteredFilesWithText.length > 0 ? (
        filteredFilesWithText.map((file) => (
          <div key={file.id} className="fileDisplay">
            {isPdf(file) ? (
              !renderErrors[file.blobUrl] ? (
                <iframe
                  src={file.blobUrl}
                  title={file.name}
                  style={{ width: "9rem", height: "12rem" }}
                  onError={() => handleRenderError(file.blobUrl)}
                ></iframe>
              ) : (
                <i className="fa-regular fa-file-pdf pdfIcon"></i>
              )
            ) : isImage(file) ? (
              !renderErrors[file.blobUrl] ? (
                <img
                  src={file.blobUrl}
                  alt={file.name}
                  style={{ width: "9rem", height: "12rem" }}
                  onError={() => handleRenderError(file.blobUrl)}
                />
              ) : (
                <i className="fa-regular fa-file-image imageIcon"></i>
              )
            ) : isWordDoc(file) ? (
              <i className="fa-regular fa-file-word wordIcon"></i>
            ) : (
              <i className="fa-regular fa-file wordIcon"></i>
            )}

            <div className="fileDisplayText">
              <p className="pdfText">{file.name}</p>
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
              {isPdf(file) || isImage(file) || isWordDoc(file) ? (
                <button
                  onClick={() => openIndividualFile(file)}
                  className="fileView"
                >
                  View File
                </button>
              ) : null}
              <button
                onClick={() => handleDeleteFile(file.id)}
                className="fileDelete"
              >
                Delete File
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="noFilesToDisplayText">No files to display</p>
      )}
    </div>
  );
}
