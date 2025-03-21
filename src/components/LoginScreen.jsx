import React, { useState } from "react";

export default function LoginScreen() {
  const [showLoginScreen, toggleShowLoginScreen] = useState(false);

  if (!showLoginScreen) {
    return <div></div>;
  }

  return (
    <div className="loginPageDiv">
      <h1>
        <span className="chap">Chap</span>
        <span className="book">book</span>
      </h1>
      <div className="emailLoginDiv">
        <p>Email:</p>
        <input className="emailLoginInput" placeholder="Enter Email"></input>
      </div>
      <div className="passwordLoginDiv">
        <p>Password:</p>
        <input
          className="passwordLoginInput"
          placeholder="Enter Password"
        ></input>
      </div>
      <p className="notAMemberText">
        Not a member? <button className="signUpButton">SIGN UP</button>
      </p>
    </div>
  );
}
