import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";
import jwt_decode from "jwt-decode";

export default function GoogleLoginButton({
  onSuccessCallback,
  buttonText = "signin_with", // or "signup_with"
  fetchFiles,
  setToggleSideBar,
  setShowAllFiles,
  closeAuthScreens,
  setError,
}) {
  const handleGoogleLogin = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;

    try {
      const response = await fetch(`${getBaseUrlWithEnv()}/api/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        const decoded = jwt_decode(data.token);

        if (decoded.userId) {
          localStorage.setItem("userId", decoded.userId);
        } else {
          console.warn("userId not found in decoded token");
        }

        setToggleSideBar(true);
        setShowAllFiles(true);
        closeAuthScreens();
        if (typeof fetchFiles === "function") fetchFiles();
        if (typeof onSuccessCallback === "function") onSuccessCallback();
      } else {
        setError?.(data.error || "Google login failed");
      }
    } catch (err) {
      setError?.("Network error during Google login");
    }
  };

  return (
    <GoogleLogin
      text={buttonText}
      onSuccess={handleGoogleLogin}
      onError={() =>
        setError?.("Google Sign In was unsuccessful. Try again later.")
      }
    />
  );
}
