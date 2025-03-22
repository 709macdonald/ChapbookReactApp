import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import "./styles/sideBar.css";
import "./styles/individualFileScreen.css";
import "./styles/newDocumentPage.css";
import "./styles/fileSearchScreen.css";
import "./styles/toolTip.css";
import "./styles/loginScreen.css";
import "./styles/signUpScreen.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
