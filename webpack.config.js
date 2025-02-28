const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'popup': './popup/popup.js',
    'content/content': './content/content.js',
    'background/background': './background/background.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: '' },
        { from: 'popup/popup.html', to: 'popup.html' },
        { from: 'popup/popup.css', to: 'popup.css' },
        { 
          from: 'assets', 
          to: 'assets', 
          noErrorOnMissing: true 
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
