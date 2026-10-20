import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// in alcuni contenitori (anteprime incorporate) anche solo leggere navigator.serviceWorker genera un errore
if (import.meta.env.PROD && import.meta.env.MODE !== "preview") {
  addEventListener("load", () => {
    try { navigator.serviceWorker?.register("sw.js").catch(() => {}); } catch { /* non disponibile */ }
  });
}
