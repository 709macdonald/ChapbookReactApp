import React, { useState } from "react";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";
import { GoogleLogin } from "@react-oauth/google";

export default function SignUpScreen({
  setToggleSideBar,
  showSignUpScreen,
  SetShowSignUpScreen,
  setShowLoginScreen,
  setShowAllFiles,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!showSignUpScreen) {
    return <div></div>;
  }

  const handleSignUp = async () => {
    setError("");
    setSuccessMessage("");
    const user = { firstName, lastName, email, password };

    try {
      const response = await fetch(`${getBaseUrlWithEnv()}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Account created successfully!");
        setToggleSideBar(true);
        setShowAllFiles(true);
        SetShowSignUpScreen(false);
      } else {
        setError(data.error || "Account creation failed");
      }
    } catch (err) {
      setError("Network error, please try again");
    }
  };

  const showLoginPage = () => {
    setShowLoginScreen(true);
    SetShowSignUpScreen(false);
  };

  return (
    <div className="signUpPageDiv">
      <h1>
        <span className="chap">Chap</span>
        <span className="book">book</span>
      </h1>
      <p className="signUpInstructionsText">
        Complete all fields to create an account
      </p>
      <div className="firstNameCreateDiv">
        <p>First Name:</p>
        <input
          className="firstNameCreateInput"
          placeholder="Enter First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div className="lastNameCreateDiv">
        <p>Last Name:</p>
        <input
          className="lastNameCreateInput"
          placeholder="Enter Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className="emailCreateDiv">
        <p>Email:</p>
        <input
          className="emailCreateInput"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="passwordCreateDiv">
        <p>Password:</p>
        <input
          className="passwordCreateInput"
          placeholder="Enter Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="createAccountButton" onClick={handleSignUp}>
        Create Account
      </button>
      <GoogleLogin
        text="signup_with" // 👈 This is the key!
        onSuccess={async (credentialResponse) => {
          const googleToken = credentialResponse.credential;

          try {
            const response = await fetch(
              `${getBaseUrlWithEnv()}/api/google-login`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: googleToken }),
              }
            );

            const data = await response.json();

            if (response.ok) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("userId", data.userId);

              setToggleSideBar(true);
              setShowAllFiles(true);
              SetShowSignUpScreen(false);
              alert("Signed up with Google!");
            } else {
              setError(data.error || "Google Sign-Up failed");
            }
          } catch (err) {
            setError("Network error during Google Sign-Up");
          }
        }}
        onError={() => {
          setError("Google Sign-Up failed.");
        }}
      />

      {error && <p className="errorText">{error}</p>}
      {successMessage && <p className="successText">{successMessage}</p>}
      <p className="alreadyAMemberText">
        Already a member?{" "}
        <button onClick={showLoginPage} className="goToLoginButton">
          LOGIN
        </button>
      </p>
    </div>
  );
}
