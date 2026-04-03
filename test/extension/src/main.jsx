
// main.jsx — React entry point for PhishGuard.AI popup
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./Popup.jsx";
 
const root = createRoot(document.getElementById("root"));
root.render(<App />);
 