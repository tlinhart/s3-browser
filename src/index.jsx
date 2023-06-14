import { initializeFaro } from "@grafana/faro-web-sdk";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

if (process.env.FARO_ENDPOINT_URL) {
  initializeFaro({
    url: process.env.FARO_ENDPOINT_URL,
    app: {
      name: APP_NAME,
      version: APP_VERSION,
      environment: process.env.NODE_ENV,
    },
  });
}

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
