var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "index.js",
    libraryTarget: 'umd'
  },
  externals: {
    'pixi.js': 'PIXI'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules\/(?!(huozi))/, loader: "babel-loader" },
      { test: /\.pegjs$/, exclude: /node_modules/, loader: 'pegjs-loader' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: 'production',
      },
    }),
    new webpack.BannerPlugin(fs.readFileSync('./LICENSE', 'utf8')),
  ]
};
