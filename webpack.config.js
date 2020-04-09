const path = require("path");
module.exports = {
  entry: "./src/test.ts",
  output: {
    filename: "./dist/bundle.js"
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: "inline-source-map",
  resolve: {
    // Add '.ts' as resolvable extensions.
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: ["ts-loader"]
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, "."),
    compress: true,
    port: 8080
  },
  // Omit "externals" if you don't have any. Just an example because it's
  // common to have them.
  externals: {
    // Don't bundle giant dependencies, instead assume they're available in
    // the html doc as global variables node module name -> JS global
    // through which it is available
    //"pixi.js": "PIXI"
  }
};