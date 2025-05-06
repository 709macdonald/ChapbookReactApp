import React, { useState } from "react";
import jwt_decode from "jwt-decode";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";
import GoogleLoginButton from "./GoogleLoginButton";
import { toast } from "react-hot-toast";

export default function SignUpScreen({
  setToggleSideBar,
  showSignUpScreen,
  SetShowSignUpScreen,
  setShowLoginScreen,
  setShowAllFiles,
  setEmail,
  email,
  fetchFiles,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!showSignUpScreen) return <div></div>;

  const handleSignUp = async () => {
    setError("");
    setSuccessMessage("");

    const user = { firstName, lastName, email, password };

    try {
      const response = await fetch(`${getBaseUrlWithEnv()}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;

        if (!token) throw new Error("No token returned on signup.");

        localStorage.setItem("token", token);
        const decoded = jwt_decode(token);

        if (decoded.userId) {
          localStorage.setItem("userId", decoded.userId);
        }

        setToggleSideBar(true);
        setShowAllFiles(true);
        SetShowSignUpScreen(false);
        setShowLoginScreen(false);
        fetchFiles();
        setEmail("");
        toast.success("🎉 Account created & logged in!");
      } else {
        setError(data.error || "Account creation failed");
        alert("❌ Failed to create account.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error, please try again");
      alert("❌ Network error during signup.");
    }
  };

  const showLoginPage = () => {
    setShowLoginScreen(true);
    SetShowSignUpScreen(false);
  };

  return (
    <div className="centerWrapperDiv">
      <div className="signUpPageDiv">
        <h1>
          <span className="chap">Chap</span>
          <span className="book">book</span>
        </h1>
        <p className="signUpInstructionsText">
          Complete all fields to create an account
        </p>

        <div className="signUpFormWrapper">
          <div className="formRow">
            <label>First Name:</label>
            <input
              className="formInput"
              placeholder="Enter First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="formRow">
            <label>Last Name:</label>
            <input
              className="formInput"
              placeholder="Enter Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="formRow">
            <label>Email:</label>
            <input
              className="formInput"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="formRow">
            <label>Password:</label>
            <input
              className="formInput"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="createAccountButton" onClick={handleSignUp}>
            Create Account
          </button>

          <GoogleLoginButton
            buttonText="signin_with"
            fetchFiles={fetchFiles}
            setToggleSideBar={setToggleSideBar}
            setShowAllFiles={setShowAllFiles}
            closeAuthScreens={() => {
              setShowLoginScreen(false);
              setEmail("");
            }}
            setError={setError}
          />

          <p className="alreadyAMemberText">
            Already a member?{" "}
            <button onClick={showLoginPage} className="goToLoginButton">
              LOGIN
            </button>
          </p>

          {error && <p className="errorText">{error}</p>}
          {successMessage && <p className="successText">{successMessage}</p>}
        </div>
      </div>
    </div>
  );
}
