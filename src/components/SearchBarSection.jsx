import React, { useState, useEffect } from "react";

export default function SearchBarSection({
  searchWord,
  setSearchWord,
  setSimilarWords,
  suggestions,
  setSuggestions,
}) {
  useEffect(() => {
    if (searchWord) {
      fetchSimilarWords(searchWord);
    } else {
      setSuggestions([]);
    }
  }, [searchWord]);

  const fetchSimilarWords = async (word) => {
    try {
      const response = await fetch(`https://api.datamuse.com/words?ml=${word}`);
      const data = await response.json();
      const similarWords = data.slice(0, 10).map((item) => item.word);
      setSuggestions(similarWords);
      setSimilarWords(similarWords);
    } catch (error) {
      console.error("Error fetching similar words:", error);
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
