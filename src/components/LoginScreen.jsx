import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";
import GoogleLoginButton from "./GoogleLoginButton";
import { toast } from "react-hot-toast";

export default function LoginScreen({
  setToggleSideBar,
  setShowAllFiles,
  SetShowSignUpScreen,
  showLoginScreen,
  setShowLoginScreen,
  fetchFiles,
  setEmail,
  email,
  setShowTutorial,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [disableLoginButton, setDisableLoginButton] = useState(true); // ✅ track disabled state

  // ✅ watch for field changes to toggle the button disabled
  useEffect(() => {
    if (email.trim() !== "" && password.trim() !== "") {
      setDisableLoginButton(false);
    } else {
      setDisableLoginButton(true);
    }
  }, [email, password]);

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
          fetchFiles();
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

    if (!email || !password) {
      alert("❌ Please enter both email and password");
      return;
    }

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

        if (!token) throw new Error("No token returned");

        localStorage.setItem("token", token);
        const decoded = jwt_decode(token);
        if (decoded.userId) {
          localStorage.setItem("userId", decoded.userId);
        }

        const tutorialView = localStorage.getItem("tutorialView");
        if (tutorialView === null) {
          localStorage.setItem("tutorialView", "true");
          setShowTutorial(true);
        } else {
          setShowTutorial(tutorialView === "true");
        }

        setIsLoggedIn(true);
        setToggleSideBar(true);
        setShowAllFiles(true);
        setShowLoginScreen(false);
        fetchFiles();

        toast.success("✅ Login successful!");
      } else {
        setError(data.error || "Login failed");
        alert(`❌ Login failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error, please try again");
      alert(`❌ Login failed: ${err.message || "Network error"}`);
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
        localStorage.setItem("isGuest", "true");
      }

      setIsLoggedIn(true);
      setToggleSideBar(true);
      setShowAllFiles(true);
      setShowLoginScreen(false);
      fetchFiles();

      localStorage.setItem("tutorialView", "true");
      setShowTutorial(true);

      toast.success("👋 Guest login successful!");
    } catch (err) {
      console.error("Guest login failed", err);
      setError("Failed to log in as guest");
      alert(`❌ Guest login failed: ${err.message || "Unknown error"}`);
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
        <div className="loginFormWrapper">
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

          <button
            className="loginButton"
            onClick={handleLogin}
            disabled={disableLoginButton}
          >
            Login
          </button>

          <button className="guestLoginButton" onClick={handleGuestLogin}>
            Sign In as Guest
          </button>

          <GoogleLoginButton
            buttonText="signin_with"
            fetchFiles={fetchFiles}
            setToggleSideBar={setToggleSideBar}
            setShowAllFiles={setShowAllFiles}
            closeAuthScreens={() => {
              setShowLoginScreen(false);
              setIsLoggedIn(true);
              setEmail("");
            }}
            setError={setError}
          />

          <p className="notAMemberText">
            Not a member?{" "}
            <button onClick={showSignUpPage} className="signUpButton">
              SIGN UP
            </button>
          </p>

          {error && <p className="errorText">{error}</p>}
        </div>
      )}
    </div>
  );
}
