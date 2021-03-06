'use strict';

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const localIdentName = require('../../config/css-scope-pattern');

module.exports = (separateCss, cssModules, tpaStyle) => {
  const cssLoaderOptions = {
    modules: cssModules,
    camelCase: true,
    sourceMap: !!separateCss,
    localIdentName,
    importLoaders: tpaStyle ? 4 : 3
  };

  const sassLoaderOptions = {
    sourceMap: true,
    includePaths: ['node_modules', 'node_modules/compass-mixins/lib']
  };

  return {
    client: {
      test: /\.s?css$/,
      use: clientLoader(separateCss, {loader: 'style-loader', options: {singleton: true}}, [
        {
          loader: 'css-loader',
          options: cssLoaderOptions
        },
        {
          loader: 'postcss-loader',
          options: {
            config: path.join(__dirname, '..', '..', 'config', 'postcss.config.js')
          }
        },
        ...tpaStyle ? ['wix-tpa-style-loader'] : [],
        {
          loader: 'sass-loader',
          options: sassLoaderOptions
        }
      ])
    },
    specs: {
      test: /\.s?css$/,
      use: [
        {
          loader: 'css-loader/locals',
          options: cssLoaderOptions
        },
        ...tpaStyle ? ['wix-tpa-style-loader'] : [],
        {
          loader: 'sass-loader',
          options: sassLoaderOptions
        }
      ]
    }
  };
};

function clientLoader(separateCss, l1, l2) {
  return separateCss ? ExtractTextPlugin.extract({fallback: l1, use: l2}) : [l1].concat(l2);
}
