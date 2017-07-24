var path = require('path');
var glob = require("glob");

var TapWebpackPlugin = require('tap-webpack-plugin');
var APP_DIR = path.resolve(__dirname, 'src/');
var TEST_DIR = path.resolve(__dirname, 'test/');

module.exports = function(env) {
  exports = [];
  if (env && env.test == 'true') {
    exports.push({
      entry: glob.sync(TEST_DIR + "/**/*.js"),
      target: 'node',
      output: {
        filename: 'test.js',
        path: path.resolve(__dirname, 'public')
      },
      module: {
        loaders: [
          // Eslint loader
          {
            // Make sure we lint before we transform code
            enforce: "pre",
            // Only test js files
            test: [/\.js$/],
            // Only include files in the client and test directory (so we don't compile our node modules or server side code)
            include: [TEST_DIR, APP_DIR],
            loader: 'eslint-loader',
          },
          // Babel javascript loader, convert js files to es5 javascript
          {
            // Only test js files
            test: [/\.js$/],
            // Only include files in the src/ directory (so we don't compile our node modules or server side code)
            include: [TEST_DIR, APP_DIR],
            loader: 'babel-loader',
            query: {
              //use es6 syntax
              presets: ['es2015'],
              // makes output more concise
              plugins: ['transform-runtime'],
            }
          }
        ]
      },
      plugins: [
        new TapWebpackPlugin()
      ]
    });
  }
  exports.push({
    entry: APP_DIR + '/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'public')
    },

    module: {
      loaders: [
        // Eslint loader
        {
          // Make sure we lint before we transform code
          enforce: "pre",
          // Only test js files
          test: [/\.js$/],
          // Only include files in the client directory (so we don't compile our node modules or server side code)
          include: APP_DIR,
          loader: 'eslint-loader',
        },
        // Babel javascript loader, convert js files to es5 javascript
        {
          // Only test js files
          test: [/\.js$/],
          // Only include files in the src/ directory (so we don't compile our node modules or server side code)
          include: APP_DIR,
          loader: 'babel-loader',
          query: {
            //use es6 syntax
            presets: ['es2015'],
            // makes output more concise
            plugins: ['transform-runtime'],
          }
        }
      ]
    },
    resolve: {
      // Look for modules in node_modules directory for imports
      modules: [
        path.join(__dirname, ''),
        'node_modules',
      ],
      // Resolve these file types
      extensions: ['.js', '.jsx', 'css']
    }
  });
  return exports;
};
