import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Import the dev tools and initialize them
if (import.meta.env.VITE_TEMPO === "true") {
  import("tempo-devtools")
    .then(({ TempoDevtools }) => {
      TempoDevtools.init();
    })
    .catch(console.error);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
