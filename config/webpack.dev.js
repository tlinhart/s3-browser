const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devServer: {
    static: path.resolve(__dirname, "../dist"),
    hot: true,
  },
  devtool: "eval-source-map",
});
