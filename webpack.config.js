const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    // Fix for cross-realm object access issues
    // Use 'self' for web workers, 'window' for browser, or 'globalThis' for universal
    globalObject: 'globalThis',
    // Alternative options depending on your use case:
    // globalObject: 'self',        // For web workers
    // globalObject: 'window',      // For browser only
    // globalObject: 'this',        // For UMD builds
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'style.css', to: 'style.css' },
        { from: 'sprite.png', to: 'sprite.png' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    hot: true,
  },
};

