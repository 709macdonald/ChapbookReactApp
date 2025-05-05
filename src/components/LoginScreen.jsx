import React, { useState, useEffect } from "react";

import jwt_decode from "jwt-decode";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";
import GoogleLoginButton from "./GoogleLoginButton";
import { useSnackbar } from "react-simple-snackbar";

export default function LoginScreen({
  setToggleSideBar,
  setShowAllFiles,
  SetShowSignUpScreen,
  showLoginScreen,
  setShowLoginScreen,
  fetchFiles,
  setEmail,
  email,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [openSnackbar] = useSnackbar();

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
          if (!localStorage.getItem("userId") && decoded.userId) {
            localStorage.setItem("userId", decoded.userId);
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
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;

        if (!token) {
          throw new Error("No token returned");
        }

        localStorage.setItem("token", token);

        const decoded = jwt_decode(token);

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

        openSnackbar("✅ Login successful!"); // ✅ Snackbar here
      } else {
        setError(data.error || "Login failed");

        openSnackbar("❌ Login failed. Try again."); // ✅ Snackbar here
      }
    } catch (err) {
      setError("Network error, please try again");

      openSnackbar("❌ Network Error. Please try again later."); // ✅ Snackbar here
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await fetch(`${getBaseUrlWithEnv()}/api/guest-login`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Guest login failed");

      const { token } = data;
      localStorage.setItem("token", token);

      const decoded = jwt_decode(token);
      if (decoded.userId) {
        localStorage.setItem("userId", decoded.userId);
        localStorage.setItem("isGuest", "true"); // 👈 important
      }

      setIsLoggedIn(true);
      setToggleSideBar(true);
      setShowAllFiles(true);
      setShowLoginScreen(false);
      fetchFiles();

      openSnackbar("👋 Guest login successful!");
    } catch (err) {
      console.error("Guest login failed", err);
      setError("Failed to log in as guest");
      openSnackbar("❌ Guest login failed.");
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
          <button className="loginButton" onClick={handleLogin}>
            Login
          </button>
        </>
      )}
      <button className="guestLoginButton" onClick={handleGuestLogin}>
        Sign In as Guest
      </button>

      <p className="notAMemberText">
        Not a member?{" "}
        <button onClick={showSignUpPage} className="signUpButton">
          SIGN UP
        </button>
      </p>
      <GoogleLoginButton
        buttonText="signin_with"
        fetchFiles={fetchFiles}
        setToggleSideBar={setToggleSideBar}
        setShowAllFiles={setShowAllFiles}
        closeAuthScreens={() => {
          setShowLoginScreen(false);
          setIsLoggedIn(true);
          setEmail(""); // clears the input
        }}
        setError={setError}
      />

      {error && <p className="errorText">{error}</p>}
    </div>
  );
}
