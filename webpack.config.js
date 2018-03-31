var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "index.js",
    libraryTarget: 'umd'
  },
  externals: [nodeExternals()],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules\/(?!(huozi))/, loader: "babel-loader" },
      { test: /\.pegjs$/, exclude: /node_modules/, loader: 'pegjs-loader' },
      {
        test: /\.rs$/,
        use: [{
          loader: 'wasm-loader'
        }, {
          loader: 'rust-native-wasm-loader',
          options: {
            release: true
          }
        }]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify("production"),
      },
    }),
    new webpack.BannerPlugin(fs.readFileSync('./LICENSE', 'utf8')),
  ]
};
