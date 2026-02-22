const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WarningsToErrorsPlugin = require('warnings-to-errors-webpack-plugin');
//require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.development' });

module.exports = (env, argv) => {
  require('dotenv').config({ path: path.resolve(__dirname, argv && argv.mode === 'production' ? '.env' : '.env.development') });
  return ({
  entry: {
    bundle: 'index.tsx'
  },
  output: {
    path: path.resolve(__dirname, './target/classes/static'),
    filename: 'js/[name].js',
    publicPath: '/'
  },
  devtool: argv.mode === 'production' ? false : 'eval-source-map',
  performance: {
    maxEntrypointSize: 488000,
    maxAssetSize: 488000
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new Dotenv({
      path: argv.mode === 'production' ? '.env' : '.env.development'
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: './public'
      }],
    }),
    new WarningsToErrorsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader']
      },
      {
        test: /\.css$/,
        use: [
          argv.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('@tailwindcss/postcss')
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.(woff2|woff|ttf|png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset'
      }
    ]
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  devServer: {
    port: parseInt(process.env.PORT || (env && env.PORT) || '3000', 10),
    compress: true,
    historyApiFallback: {
      disableDotRule: true
    },
    hot: true,
    static: false,
    watchFiles: [
      '**',
    ]
  }
  });
};
