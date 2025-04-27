import { initializeFaro } from "@grafana/faro-web-sdk";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// https://webpack.js.org/concepts/hot-module-replacement/
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
