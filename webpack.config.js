const webpack = require('webpack');

const path = require('path');

module.exports = {
  entry: './app/jsx/staff_application/main.jsx',
  mode: 'development',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'app/static/js/react/staff_application'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  }
}
