import React, { useState, useEffect, useRef } from "react";

export default function SearchBarSection({
  files,
  searchWord,
  setSearchWord,
  assistedSearchWords,
  setAssistedSearchWords,
  hideSearchSection,
  resultsCount,
  setSortCriteria,
  sortCriteria,
}) {
  const [isAssistedSearchEnabled, setIsAssistedSearchEnabled] = useState(false);
  const [showAssistedSearchWords, setShowAssistedSearchWords] = useState(false);

  const [predictiveTextWords, setPredictiveTextWords] = useState([]);
  const searchRef = useRef(null);

  /* ASSISTED SEARCH */

  useEffect(() => {
    if (searchWord && isAssistedSearchEnabled) {
      fetchSimilarWords(searchWord);
    } else {
      setAssistedSearchWords([]);
    }
  }, [searchWord, isAssistedSearchEnabled]);

  const fetchSimilarWords = async (word) => {
    try {
      const response = await fetch(`https://api.datamuse.com/words?ml=${word}`);
      const data = await response.json();
      const similarWords = data.slice(0, 10).map((item) => item.word);
      setAssistedSearchWords(similarWords);
    } catch (error) {
      console.error("Error fetching similar words:", error);
    }
  };

  const toggleAssistedSearch = () => {
    setIsAssistedSearchEnabled((prev) => !prev);
    if (!isAssistedSearchEnabled) {
      setAssistedSearchWords([]);
    }
  };

  const toggleShowAssistedSearchWords = () => {
    setShowAssistedSearchWords((prev) => !prev);
  };

  useEffect(() => {
    if (searchWord) {
      const allWords = new Set();
      files.forEach((file) => {
        const words = file.text.split(/\s+/);
        words.forEach((word) => allWords.add(word.toLowerCase()));
      });

      const filteredPredictiveTextWords = Array.from(allWords)
        .filter(
          (word) =>
            word.startsWith(searchWord.toLowerCase()) &&
            word !== searchWord.toLowerCase()
        )
        .slice(0, 10);

      setPredictiveTextWords(filteredPredictiveTextWords);
    } else {
      setPredictiveTextWords([]);
    }
  }, [searchWord, files]);

  const handleSuggestionClick = (word) => {
    setSearchWord(word);
    setPredictiveTextWords([]);
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setPredictiveTextWords([]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setPredictiveTextWords([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (hideSearchSection) return <div></div>;

  return (
    <div className="searchSectionDiv" ref={searchRef}>
      <input
        type="text"
        id="searchBar"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for Keywords"
      />
      <p className="resultsFound">{resultsCount} results found</p>

      <div className="sortingControls tooltip-wrapper">
        <span className="tooltip">Organize files by</span>
        <select
          className="sortingSelect"
          onChange={(e) => setSortCriteria(e.target.value)}
          value={sortCriteria}
        >
          <option value="nameA-Z">Name (A-Z)</option>
          <option value="nameZ-A">Name (Z-A)</option>
          <option value="dateOldNew">Date (Old - New)</option>
          <option value="dateNewOld">Date (New - Old)</option>
          <option value="wordCount">Word Count</option>
        </select>
      </div>

      <hr />
      {predictiveTextWords.length > 0 && (
        <div className="predictiveTextWordsDiv">
          {predictiveTextWords.map((predictiveTextWord, index) => (
            <div
              key={index}
              className="predictiveTextWord"
              onClick={() => handleSuggestionClick(predictiveTextWord)}
            >
              {predictiveTextWord}
            </div>
          ))}
        </div>
      )}
      <div className="assistedSearchDiv">
        <div className="tooltip-wrapper">
          <span className="tooltip">
            Search for words similar to your Keyword.
          </span>
          <div className="assistedSearchTitleAndButtonDiv">
            <p className="assistedSearchTitle">Assisted Search</p>
            <button
              className="assistedSearchButton"
              onClick={toggleAssistedSearch}
            >
              {isAssistedSearchEnabled ? (
                <i className="fa-solid fa-square-check"></i>
              ) : (
                <i className="fa-solid fa-square-xmark"></i>
              )}
            </button>
          </div>
        </div>
        <div className="tooltip-wrapper">
          <span className="tooltip">
            {showAssistedSearchWords ? "Hide" : "Show"} the Assisted Search word
            bank.
          </span>
          <button
            className="showAssistedSearchButton"
            onClick={toggleShowAssistedSearchWords}
          >
            {showAssistedSearchWords ? "Hide" : "Show"} Words
          </button>
        </div>
        {showAssistedSearchWords && isAssistedSearchEnabled && searchWord && (
          <div className="assistedSearchWordsDiv fade-in">
            <p className="assistedSearchTableTitle">Assisted Search Words:</p>
            {assistedSearchWords.map((assistedSearchWord, index) => (
              <div key={index} className="assistedSearchWord fade-in">
                {assistedSearchWord}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
