# tagprobot
## Installation
1. Install NVM using terminal:
```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
```
2. Restart your bash session and install node using NVM: `nvm install node`
3. In this directory, install the node packages, including webpack: `npm install`

## Running the App
- Run `npm run build`.  This will start webpack, which will "watch" the files in `src/` and will update the bundle automatically.  This will also run eslint whenever your code changes so you can see if the linter fails.
- To test your code, make sure webpack is running and copy-paste the code in `public/bundle.js` into tampermonkey.

## Current bot control logic

![](resources/fsm.png)

# Possible Development Strategy
First, let's aim to compete in the single-flag map "Command Center". Tentative competition date is in two weeks.
Command Center: http://i.imgur.com/aBaFYDB.png  
Command Center Testing Map: http://maps.jukejuice.com/maptest/3307/ca

Read up on TagPro's bot rules before running anything
https://www.reddit.com/r/tagprobots/comments/2vtgru/how_to_prevent_unnecessary_bot_bans/

idk this could be useful
https://www.reddit.com/r/TagPro/comments/3ii5xq/userscript_live_map_editor_and_partially_offline/
## Goal 0: Infrastructure
 - Get connected to the TagPro API
 - potentially use https://github.com/chrahunt/tagpro-dot-bot
  - https://gist.github.com/chrahunt/90d1c4aab5ad81ec4812
 - Other helpful information:
  - https://www.reddit.com/r/tagpro/wiki/modding
  - https://www.reddit.com/r/TagPro/wiki/api

## Goal 1: Maneuvering Safely
 - Don't hit things that kill you
 - Don't get stuck on walls or corners

## Goal 2: Maneuvering Swiftly
 - Get flag
 - Boosts?
 - Bombs?
 - Portals?

## Goal 3: Maneuvering Smartly
 - Intermediately goal selection
 - Jukes
 - Good grabbing
 - Machine learning? https://www.reddit.com/r/tagprobots/comments/5ptfrg/dataset_of_1900_tagpro_replays_from_the/
 
## Goal 4: ???

## Goal 5: Profit
