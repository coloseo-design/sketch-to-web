/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
// webpackage.config.js
const { resolve } = require;
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const plugins = [
  new HtmlWebPackPlugin({
    template: 'public/index.html',
    filename: 'index.html',
    inject: true,
  }),
  new CleanWebpackPlugin(),
];
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name]-[hash].css',
      chunkFilename: '[id]-[hash].css',
    }),
  );
}

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'cheap-module-source-map',
  devServer: {
    contentBase: path.join(__dirname, './src/'),
    publicPath: '/',
    host: '127.0.0.1',
    port: 3005,
    stats: {
      colors: true,
    },
  },
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, './dist'),
    publicPath: './',
    filename: '[name]-[hash].js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        exclude: /node_modules|src\/docs|src\/demos/,
        include: /src/,
        loader: 'eslint-loader',
      },
      {
        test: /\.(less|css)$/,
        use: [
          process.env.NODE_ENV === 'production' ? { loader: MiniCssExtractPlugin.loader } : { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|mp4)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: false,
              name: 'static/[name].[hash:8].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        // exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                'babel-plugin-styled-components',
                ['import', { libraryName: 'union-design-h5', libraryDirectory: 'lib', style: (name) => `${name}/styles/css` }, 'uni'],
                ['import', { libraryName: 'union-design', libraryDirectory: 'lib', style: (name) => `${name}/styles/css` }, 'uni-pc'],
                [
                  resolve('@babel/plugin-transform-typescript'),
                  {
                    isTSX: true,
                  },
                ],
                resolve('babel-plugin-inline-import-data-uri'),
                resolve('@babel/plugin-transform-member-expression-literals'),
                resolve('@babel/plugin-transform-object-assign'),
                resolve('@babel/plugin-transform-property-literals'),
                [
                  resolve('@babel/plugin-transform-runtime'),
                  {
                    helpers: false,
                  },
                ],
                resolve('@babel/plugin-transform-spread'),
                resolve('@babel/plugin-transform-template-literals'),
                resolve('@babel/plugin-proposal-export-default-from'),
                resolve('@babel/plugin-proposal-export-namespace-from'),
                resolve('@babel/plugin-proposal-object-rest-spread'),
                [
                  resolve('@babel/plugin-proposal-decorators'),
                  {
                    legacy: true,
                  },
                ],
                resolve('@babel/plugin-proposal-class-properties'),
              ],
              presets: [
                '@babel/preset-env',
                [
                  '@babel/preset-react',
                  {
                    // modules,
                    targets: {
                      browsers: [
                        'last 2 versions',
                        'Firefox ESR',
                        '> 1%',
                        'ie >= 9',
                        'iOS >= 8',
                        'Android >= 4',
                      ],
                    },
                  },
                ],
                '@babel/preset-typescript',
              ],
            },
          },
        ],
      },
    ],
  },
  plugins,
  optimization: process.env.NODE_ENV === 'production' ? {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            // 不生成内联映射,这样配置就会生成一个source-map文件
            inline: false,
            // 向css文件添加source-map路径注释
            // 如果没有此项压缩后的css会去除source-map路径注释
            annotation: true,
          },
        },
      }),
    ],
  } : {},
};
