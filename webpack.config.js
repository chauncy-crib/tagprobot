const path = require('path');

const APP_DIR = path.resolve(__dirname, 'src/');

module.exports = () => {
  exports = {
    entry: `${APP_DIR}/start.js`,
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'public'),
    },
    mode: 'development',
    module: {
      rules: [
        // Eslint loader
        {
          // Make sure we lint before we transform code
          enforce: 'pre',
          // Only test js files
          test: [/\.js$/],
          // Only include files in the client directory (so we don't compile our node modules)
          include: APP_DIR,
          loader: 'eslint-loader',
        },
        {
          test: /\.txt$/,
          use: 'raw-loader',
        },
        // Babel javascript loader, convert js files to es5 javascript
        {
          // Only test js files
          test: [/\.js$/],
          // Only include files in the src/ directory (so we don't compile our node modules)
          include: APP_DIR,
          loader: 'babel-loader',
          query: {
            // use es6 syntax
            presets: ['es2015'],
            // makes output more concise
            plugins: ['transform-runtime', 'lodash', 'rewire'],
          },
        },
      ],
    },
    resolve: {
      // Look for modules in node_modules directory for imports
      modules: [
        path.join(__dirname, ''),
        'node_modules',
      ],
      // Resolve these file types
      extensions: ['.js', '.jsx', 'css'],
    },
  };
  return exports;
};
