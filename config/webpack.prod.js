const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  plugins: [new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/main/])],
  devServer: {
    static: path.resolve(__dirname, "../dist"),
  },
  devtool: "source-map",
});
