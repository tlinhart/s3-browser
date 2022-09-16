const path = require("path");
const dotenv = require("dotenv");
const { EnvironmentPlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Supported environment variables with default values
// (see https://webpack.js.org/plugins/environment-plugin/#usage-with-default-values).
const envVars = {
  AWS_REGION: undefined,
  AWS_ACCESS_KEY_ID: undefined,
  AWS_SECRET_ACCESS_KEY: undefined,
  BUCKET_NAME: undefined,
  EXCLUDE_PATTERN: "^index\\.html$",
};

// Load variables from .env file into environment.
dotenv.config({ override: false });

// Merge supported variables from the environment with the defaults
// (see https://github.com/motdotla/dotenv#how-come-my-environment-variables-are-not-showing-up-for-react).
Object.assign(
  envVars,
  Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key in envVars)
  )
);

module.exports = {
  entry: path.resolve(__dirname, "../src/index.jsx"),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  plugins: [
    new EnvironmentPlugin(envVars),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../src/index.html"),
      favicon: path.resolve(__dirname, "../src/favicon.svg"),
      inject: "body",
    }),
  ],
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "main.js",
    clean: true,
  },
};
