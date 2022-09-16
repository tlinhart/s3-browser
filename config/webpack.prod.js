const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const InlineIconHtmlPlugin = require("html-webpack-inline-icon-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/main/]),
    new InlineIconHtmlPlugin(HtmlWebpackPlugin, [/favicon/]),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
        },
      }),
    ],
  },
  devtool: "source-map",
});
