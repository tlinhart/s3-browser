import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// https://webpack.js.org/concepts/hot-module-replacement/
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
