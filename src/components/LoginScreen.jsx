import React, { useState, useEffect } from "react";

export default function LoginScreen() {
  const [showLoginScreen, toggleShowLoginScreen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

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
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
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
