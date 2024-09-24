import React, { useState, useEffect, useRef } from "react";

export default function SearchBarSection({
  files,
  searchWord,
  setSearchWord,
  assistedSearchWords,
  setAssistedSearchWords,
}) {
  const [isAssistedSearchEnabled, setIsAssistedSearchEnabled] = useState(true);
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

  /* PREDICTIVE TEXT */

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

      <button className="assistedSearchButton" onClick={toggleAssistedSearch}>
        {isAssistedSearchEnabled
          ? "Disable Assisted Search"
          : "Enable Assisted Search"}
      </button>

      {isAssistedSearchEnabled && (
        <div className="assistedSearchWordsDiv fade-in">
          <p>Assisted Search Words</p>
          {assistedSearchWords.map((assistedSearchWord, index) => (
            <div key={index} className="assistedSearchWord fade-in">
              {assistedSearchWord}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
