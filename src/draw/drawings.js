/*
 * Note: the code in this file was written by reading this userscript:
 * https://gist.github.com/SomeBall-1/0060b3c71ec379ea7ccf
 * and doing my best to interpret what the code in it was doing.
 * As far as I know, there's no explicit documentation on how to draw on the tagpro screen (more
 * specifically, I can't find docs for the `tagpro.renderer.layers` object). There are additional
 * objects in the `layers` object, such as `foreground` and `midground`. Drawing on `background`
 * seemed to be the best thing for this feature.
 *
 * There are two functions in the background object we will use: `addChild` and `removeChild`, each
 * of which take a reference to the object being drawn/removed. We use the variables pathSprites and
 * nonTraversableCellSprites to store the sprites we're going to draw. Then, before drawing the
 * path, we erase any path that was previously drawn.
 */
import _ from 'lodash';
import { PPCL, CPTL, pathAlpha, pathColor, ntAlpha, ntColor } from '../constants';
import { init2dArray } from '../helpers/map';
import { areVisualsOn } from '../utils/interface';

let pathSprites = []; // a list of the current path sprites drawn
// a grid of NT-sprites, which are subject to change
let tempNTSprites = [];
// a list of permanent NT sprites. Will always be on map (if visualizations are on)
const permNTSprites = [];


function getRect(x, y, width, height, alpha, color) {
  const rect = new PIXI.Graphics();
  rect.beginFill(color).drawRect(
    x,
    y,
    width,
    height,
  ).alpha = alpha;
  return rect;
}

export function updatePath(path) {
  if (!areVisualsOn()) {
    return;
  }
  _.forEach(pathSprites, p => tagpro.renderer.layers.background.removeChild(p));
  pathSprites = [];
  _.forEach(path, cell => {
    const sprite = getRect(cell.x * PPCL, cell.y * PPCL, PPCL, PPCL, pathAlpha, pathColor);
    pathSprites.push(sprite);
    tagpro.renderer.layers.background.addChild(sprite);
  });
}

export function clearSprites() {
  // get a list of all sprites
  const allSprites = permNTSprites
    .concat(pathSprites)
    // flatten the tempNTSprites grid, and remove null values
    .concat(_.filter(_.flatten(tempNTSprites)), x => !_.isNull(x));
  _.forEach(allSprites, s => tagpro.renderer.layers.background.removeChild(s));
  pathSprites = [];
  tempNTSprites = [];
}

export function drawPermanentNTSprites() {
  _.forEach(permNTSprites, s => tagpro.renderer.layers.background.addChild(s));
}

export function generatePermanentNTSprites(x, y, cellTraversabilities) {
  for (let i = x * CPTL; i < (x + 1) * CPTL; i++) {
    for (let j = y * CPTL; j < (y + 1) * CPTL; j++) {
      // if we don't have a sprite already there and there should be one,
      // draw it
      if (!cellTraversabilities[i][j]) {
        const sprite = getRect(i * PPCL, j * PPCL, PPCL, PPCL, ntAlpha, ntColor);
        permNTSprites.push(sprite);
      }
    }
  }
}

/*
 * Takes in an grid of cellTraversabilities, and the x, y tile locations that we should check for
 * updates, and updates the sprites drawn on the tagpro map
 *
 * @param {number} x: x location, in tiles
 * @param {number} y: y location, in tiles
 * @param cellTraversabilities: the cell-traversabilities of the tagpro map.
 */
export function updateNTSprites(x, y, cellTraversabilities) {
  if (!areVisualsOn()) {
    return;
  }
  if (_.isEmpty(tempNTSprites)) {
    tempNTSprites = init2dArray(
      tagpro.map.length * CPTL,
      tagpro.map[0].length * CPTL,
      null,
    );
  }
  for (let i = x * CPTL; i < (x + 1) * CPTL; i++) {
    for (let j = y * CPTL; j < (y + 1) * CPTL; j++) {
      // if we don't have a sprite already there and there should be one,
      // draw it
      if (_.isNull(tempNTSprites[i][j]) && !cellTraversabilities[i][j]) {
        const sprite = getRect(i * PPCL, j * PPCL, PPCL, PPCL, ntAlpha, ntColor);
        tempNTSprites[i][j] = sprite;
        tagpro.renderer.layers.background.addChild(sprite);
      // else if we already have a sprite there and there shouldn't be one,
      // remove it
      } else if (!_.isNull(tempNTSprites[i][j]) && cellTraversabilities[i][j]) {
        const sprite = tempNTSprites[i][j];
        tagpro.renderer.layers.background.removeChild(sprite);
        tempNTSprites[i][j] = null;
      }
    }
  }
}

