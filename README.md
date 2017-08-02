# tagprobot [![Build Status](https://travis-ci.org/chauncy-crib/tagprobot.svg?branch=master)](https://travis-ci.org/chauncy-crib/tagprobot)
## Installation
1. Install NVM using terminal:
```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
```
2. Restart your bash session and install node using NVM: `nvm install node`
3. In this directory, install the node packages, including webpack: `npm install`

## Testing the App
- Run `npm test`. This will run all the test files

## Auto-linting your code
- Run `npm run lint:fix`. This lint your code and perform any fixes that can be done automatically. It will then give a report of what you still need to fix.


## Running the App
- Run `npm run build`.  This will start webpack, which will "watch" the files in `src/` and will update the bundle automatically.  This will also run eslint whenever your code changes so you can see if the linter fails.
- You can append `:once` to the previous command to run webpack without watching the files for changes.
- To test your code in tagpro, make sure webpack is running and copy-paste the code in `public/bundle.js` into tampermonkey.
