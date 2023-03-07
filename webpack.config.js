/* eslint-env node */

const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin, ProvidePlugin } = require('webpack');


module.exports = (env, argv) => {

  const mode = argv.mode || 'development';

  const devtool = mode === 'development' ? 'eval-source-map' : 'source-map';

  return {
    mode,
    entry: {
      viewer: './gz3d/bpmn-js/viewer.js',
      modeler: './gz3d/bpmn-js/modeler.js',
      instances: './gz3d/bpmn-js/instances.js'
    },
    output: {
      filename: 'dist/[name].js',
      path: __dirname + '/http/client'
    },
    module: {
      rules: [
        {
          test: /\.bpmn$/,
          type: 'asset/source'
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                [ '@babel/plugin-transform-react-jsx', {
                  'importSource': '@bpmn-io/properties-panel/preact',
                  'runtime': 'automatic'
                } ]
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: './assets', to: 'dist/vendor/bpmn-js-token-simulation/assets' },
          { from: 'bpmn-js/dist/assets', context: 'node_modules', to: 'dist/vendor/bpmn-js/assets' },
          { from: 'bpmn-js-properties-panel/dist/assets', context: 'node_modules', to: 'dist/vendor/bpmn-js-properties-panel/assets' }
        ]
      }),
      new DefinePlugin({
        'process.env.TOKEN_SIMULATION_VERSION': JSON.stringify(require('./package.json').version)
      })
    ],
    devtool
  };

};