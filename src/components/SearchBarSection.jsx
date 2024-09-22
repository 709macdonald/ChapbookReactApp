import React, { useState, useEffect } from "react";

export default function SearchBarSection({
  searchWord,
  setSearchWord,
  suggestions,
  setSuggestions,
}) {
  /* ASSISTED SEARCH */

  const [isAssistedSearchEnabled, setIsAssistedSearchEnabled] = useState(true);

  useEffect(() => {
    if (searchWord && isAssistedSearchEnabled) {
      fetchSimilarWords(searchWord);
    } else {
      setSuggestions([]);
    }
  }, [searchWord, isAssistedSearchEnabled]);

  const fetchSimilarWords = async (word) => {
    try {
      const response = await fetch(`https://api.datamuse.com/words?ml=${word}`);
      const data = await response.json();
      const similarWords = data.slice(0, 10).map((item) => item.word);
      setSuggestions(similarWords);
    } catch (error) {
      console.error("Error fetching similar words:", error);
    }
  };

  const toggleAssistedSearch = () => {
    setIsAssistedSearchEnabled((prev) => !prev);
    if (isAssistedSearchEnabled) {
      setSuggestions([]);
    }
  };

  return (
    <div className="searchSectionDiv">
      <input
        type="text"
        id="searchBar"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        placeholder="Search for Keywords"
      />
      <button>
        <i className="fa-solid fa-magnifying-glass"></i>
      </button>
      <button onClick={toggleAssistedSearch}>
        {isAssistedSearchEnabled
          ? "Disable Assisted Search"
          : "Enable Assisted Search"}
      </button>

      {/* Display suggestions */}
      <div className="suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-item">
            {suggestion}
          </div>
        ))}
      </div>
    </div>
  );
}
