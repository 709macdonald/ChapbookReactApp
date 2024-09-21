import React, { useState, useEffect } from "react";

function LoadingGear({ isLoadingFiles }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots === "...") return "";
        return prevDots + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!isLoadingFiles) return null;

  return (
    <div className="loadingScreenDiv">
      <i className="fa-solid fa-gear loadingGear"></i>
      <p className="loadingText">
        Loading your documents
        <span className="loadingDots">{dots}</span>
      </p>
    </div>
  );
}

export default LoadingGear;
