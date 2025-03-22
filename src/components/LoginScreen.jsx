import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

export default function LoginScreen() {
  const [showLoginScreen, toggleShowLoginScreen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token); // Decode the token to extract expiry
        const currentTime = Date.now() / 1000; // Get the current time in seconds

        // Check if the token has expired
        if (decoded.exp < currentTime) {
          localStorage.removeItem("token"); // Token is expired, remove it
          setIsLoggedIn(false); // Set logged-in state to false
        } else {
          setIsLoggedIn(true); // Token is valid, set logged-in state to true
        }
      } catch (error) {
        console.error("Token decoding error:", error);
        localStorage.removeItem("token"); // In case decoding fails, remove token
        setIsLoggedIn(false); // Set logged-in state to false
      }
    } else {
      setIsLoggedIn(false); // No token in localStorage, set logged-in state to false
    }
  }, []); // Runs on component mount, only once

  const handleLogin = async () => {
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token); // Save the token in localStorage
        setIsLoggedIn(true); // Update the logged-in state
        alert("Login successful!");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error, please try again");
    }
  };

  if (!showLoginScreen) {
    return <div></div>;
  }

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
        Not a member? <button className="signUpButton">SIGN UP</button>
      </p>
    </div>
  );
}
