const webpack = require('webpack');

const path = require('path');

module.exports = {
  entry: './app/jsx/staff_application/main.tsx',
  mode: 'development',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'app/static/js/react/staff_application'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/, /external/],
        use: ['ts-loader'],
      },
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
    modules: ['./node_modules']
  }
}
