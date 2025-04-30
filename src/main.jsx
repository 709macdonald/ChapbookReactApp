import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ⬅️ import this
import "./styles/index.css";
import "./styles/sideBar.css";
import "./styles/individualFileScreen.css";
import "./styles/newDocumentPage.css";
import "./styles/fileSearchScreen.css";
import "./styles/toolTip.css";
import "./styles/loginScreen.css";
import "./styles/signUpScreen.css";

const clientId =
  941831478532 - iklrlnrrvu857u85lgqek79ungfcafqp.apps.googleusercontent.com; // ⬅️ Paste your real Google client ID
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
