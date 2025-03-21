import React from "react";

export default function SignUpScreen() {
  return (
    <div className="loginPageDiv">
      <h1>
        <span className="chap">Chap</span>
        <span className="book">book</span>
        <p className="instructionsP">
          Please fill out all fields to create account
        </p>
      </h1>
      <div className="firstNameCreateDiv">
        <p>First Name:</p>
        <input
          className="firstNameCreateInput"
          placeholder="Enter First Name"
        ></input>
      </div>
      <div className="lastNameCreateDiv">
        <p>Last Name:</p>
        <input
          className="lastNameCreateInput"
          placeholder="Enter Last Name"
        ></input>
      </div>
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
      <button className="createAccountButton">Create Account</button>
      <p className="notAMemberText">
        Already a member? <button className="signUpButton">LOGIN</button>
      </p>
    </div>
  );
}
