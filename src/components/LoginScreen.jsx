import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";

export default function LoginScreen({
  setToggleSideBar,
  setShowAllFiles,
  SetShowSignUpScreen,
  showLoginScreen,
  setShowLoginScreen,
  fetchFiles,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setIsLoggedIn(false);
        } else {
          if (!localStorage.getItem("userId") && decoded.id) {
            localStorage.setItem("userId", decoded.id);
          }

          setIsLoggedIn(true);
          setToggleSideBar(true);
          setShowAllFiles(true);
          setShowLoginScreen(false);
        }
      } catch (error) {
        console.error("Token decoding error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch(`${getBaseUrlWithEnv()}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;

        if (!token) {
          throw new Error("No token returned");
        }

        localStorage.setItem("token", token);

        const decoded = jwt_decode(token);
        console.log("Decoded token:", decoded);

        if (decoded.userId) {
          localStorage.setItem("userId", decoded.userId);
        } else {
          console.warn("userId not found in decoded token");
        }

        setIsLoggedIn(true);
        setToggleSideBar(true);
        setShowAllFiles(true);
        setShowLoginScreen(false);
        fetchFiles();
        alert("Login successful!");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error, please try again");
    }
  };

  const showSignUpPage = () => {
    SetShowSignUpScreen(true);
    setShowLoginScreen(false);
  };

  if (!showLoginScreen) return <div></div>;

  return (
    <div className="loginPageDiv">
      <h1>
        <span className="chap">Chap</span>
        <span className="book">book</span>
      </h1>
      {isLoggedIn ? (
        <p>You are logged in!</p>
      ) : (
        <>
          <div className="emailLoginDiv">
            <p>Email:</p>
            <input
              className="emailLoginInput"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="passwordLoginDiv">
            <p>Password:</p>
            <input
              className="passwordLoginInput"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="errorText">{error}</p>}
          <button className="loginButton" onClick={handleLogin}>
            Login
          </button>
        </>
      )}
      <p className="notAMemberText">
        Not a member?{" "}
        <button onClick={showSignUpPage} className="signUpButton">
          SIGN UP
        </button>
      </p>
    </div>
  );
}
