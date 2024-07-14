const webpack = require('webpack');

const path = require('path');

module.exports = {
  entry: './app/jsx/staff_application/main.tsx',
  mode: 'production',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'app/static/js/react/prod/staff_application'),
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
