import React, { useState, useEffect } from "react";

export default function SearchBarSection({
  files,
  searchWord,
  setSearchWord,
  assistedSearchWords,
  setAssistedSearchWords,
}) {
  const [isAssistedSearchEnabled, setIsAssistedSearchEnabled] = useState(true);
  const [predictiveTextWords, setPredictiveTextWords] = useState([]);
  const [predictiveTextClicked, setPredictiveTextClicked] = useState(false);

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
    if (searchWord && !predictiveTextClicked) {
      // Normal predictive text logic
      const allWords = new Set();
      files.forEach((file) => {
        const words = file.text.split(/\s+/);
        words.forEach((word) => allWords.add(word.toLowerCase()));
      });

      const filteredPredictiveTextWords = Array.from(allWords).filter((word) =>
        word.startsWith(searchWord.toLowerCase())
      );

      setPredictiveTextWords(filteredPredictiveTextWords.slice(0, 10));
    } else {
      setPredictiveTextWords([]); // Clear predictive text when searchWord is empty or a suggestion is clicked
    }

    // No longer needed since the flag resets on typing
  }, [searchWord, files, predictiveTextClicked]);

  const handleSuggestionClick = (word) => {
    setSearchWord(word);
    setPredictiveTextWords("");
    setPredictiveTextClicked(true); // Set flag to avoid showing predictive text again immediately
  };

  return (
    <div className="searchSectionDiv">
      <input
        type="text"
        id="searchBar"
        value={searchWord}
        onChange={(e) => {
          setSearchWord(e.target.value);
          setPredictiveTextClicked(false); // Reset flag when user types manually
        }}
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

      <div className="assistedSearchWordsDiv">
        {assistedSearchWords.map((assistedSearchWord, index) => (
          <div key={index} className="suggestion-item">
            {assistedSearchWord}
          </div>
        ))}
      </div>
    </div>
  );
}
