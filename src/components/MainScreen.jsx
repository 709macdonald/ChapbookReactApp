import React from "react";
import LoadingGear from "./LoadingGear";
import FileSearchScreen from "./FileSearchScreen";
import IndividualFileScreen from "./IndividualFileScreen";

export default function MainScreen({ files, isLoadingFiles }) {
  return (
    <div className="mainScreenDiv">
      <div className="bgLogoDiv">
        <h2 className="chap">
          Chap<span className="book">book</span>
        </h2>
      </div>
      <LoadingGear isLoadingFiles={isLoadingFiles} />
      <FileSearchScreen />
      <IndividualFileScreen />
    </div>
  );
}
