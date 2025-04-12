import React from "react";

export default function BGLogo({ bgLogoOn }) {
  if (!bgLogoOn) return null;

  return (
    <div className="bgLogoDiv">
      <h2 className="chap">
        Chap<span className="book">book</span>
      </h2>
    </div>
  );
}
