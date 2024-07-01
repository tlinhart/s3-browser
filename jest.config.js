/** @type {import("jest").Config} */
module.exports = {
  rootDir: "src",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    uuid: "uuid",
  },
  setupFiles: ["<rootDir>/tests/setup.js"],
};
