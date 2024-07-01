/** @type {import("jest").Config} */
module.exports = {
  rootDir: "src",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/tests/setup.js"],
  transform: {
    "^.+\\.(js|jsx)$": ["babel-jest", { rootMode: "upward" }],
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(sinon)/)"],
};
