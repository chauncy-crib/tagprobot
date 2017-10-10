/*
 * Note: the code in this file was written by reading this userscript:
 * https://gist.github.com/SomeBall-1/0060b3c71ec379ea7ccf
 * and doing my best to interpret what the code in it was doing.
 * As far as I know, there's no explicit documentation on how to draw on the tagpro screen (more
 * specifically, I can't find docs for the `tagpro.renderer.layers` object). There are additional
 * objects in the `layers` object, such as `foreground` and `midground`. Drawing on `background`
 * seemed to be the best thing for this feature.
 */

import _ from 'lodash';
import {
  PPCL,
  CPTL,
  pathAlpha,
  pathColor,
  ntAlpha,
  ntColor,
  keyColor,
  keyOnAlpha,
  keyOffAlpha,
} from '../constants';
import { init2dArray } from '../helpers/map';
import { isVisualMode } from '../utils/interface';
import { assertGridInBounds } from '../utils/asserts';

let pathSprites = []; // a list of the current path sprites drawn

// a grid of NT-sprites, which are subject to change. If there isn't a NT-object at the given cell,
// then store null. This object is size tagpro_map_length * CPTL x tagpro_map_width * CPTL
let tempNTSprites = [];

// a list of permanent NT sprites. Will always be on map (if visualizations are on)
const permNTSprites = [];

// The current state of the keys being pressed
export const currKeyPresses = { x: null, y: null };
// PIXI object that holds the key press visualizations
let keyPressesVis;
// Index of specific keys inside of the graphics container's children array
const leftKeyIndex = 0;
const downKeyIndex = 1;
const rightKeyIndex = 2;
const upKeyIndex = 3;
const keySize = 30; // side length of keys in pixels
const keyGap = 4; // gap between keys in pixels


/*
 * @param {number} x - top left x, in pixels
 * @param {number} y - top left y, in pixels
 * @param {number} width - width in pixels
 * @param {number} height - height in pixels
 * @param {number} alpha - 0-1, where 0 is transparent
 * @param {number} color - a hex color
 * @return {PIXI.Graphics} a PIXI.Graphics rectangle object with the specified x, y, width, height,
 *   alpha, and color
 */
function getPixiRect(x, y, width, height, alpha, color) {
  const pixiRect = new PIXI.Graphics();
  pixiRect.beginFill(color).drawRect(
    x,
    y,
    width,
    height,
  ).alpha = alpha;
  return pixiRect;
}


/*
 * @param {number} x - top left x, in pixels
 * @param {number} y - top left y, in pixels
 * @param {number} size - side length in pixels
 * @param {number} alpha - 0-1, where 0 is transparent
 * @param {number} color - a hex color
 * @return {PIXI.Graphics} a PIXI.Graphics rectangle object with the specified x, y, size,
 *   alpha, and color
 */
function getPixiSquare(x, y, size, alpha, color) {
  return getPixiRect(x, y, size, size, alpha, color);
}


/*
 * Places the key presses visualization in the correct spot relative to the current screen size.
 * This is used to correct the placement of the key presses visualization if the user dynamically
 * resized their screen.
 */
function centerKeyPressesVis() {
  const viewport = $('#viewport');
  const screenWidth = viewport.width();
  const screenHeight = viewport.height();

  keyPressesVis.x = screenWidth / 2; // in the middle of the screen
  keyPressesVis.y = screenHeight - keySize - 60; // just above the game timer
}


/*
 * The tagpro object has a function that is called every time the user interface needs to be
 * updated (this function is defined at tagpro.ui.update). We have made additions to the UI that now
 * need to be updated along with the rest of the builtin TagPro UI. This initUiUpdateProcess
 * function appends our own custom commands to the tagpro builtin UI update commands.
 */
export function initUiUpdateProcess() {
  const updateUi = tagpro.ui.update;
  tagpro.ui.update = () => {
    updateUi();
    centerKeyPressesVis();
  };
}


/*
 * Creates the PIXI object that holds the key press visualizations and draws the initial keys.
 */
export function initKeyPressesVisualization() {
  keyPressesVis = new PIXI.DisplayObjectContainer();
  tagpro.renderer.layers.ui.addChild(keyPressesVis);
  keyPressesVis.addChildAt(
    getPixiSquare(-(1.5 * keySize) - keyGap, 0, keySize, keyOffAlpha, keyColor),
    leftKeyIndex,
  );
  keyPressesVis.addChildAt(
    getPixiSquare(-(0.5 * keySize), 0, keySize, keyOffAlpha, keyColor),
    downKeyIndex,
  );
  keyPressesVis.addChildAt(
    getPixiSquare((0.5 * keySize) + keyGap, 0, keySize, keyOffAlpha, keyColor),
    rightKeyIndex,
  );
  keyPressesVis.addChildAt(
    getPixiSquare(-(0.5 * keySize), -keySize - keyGap, keySize, keyOffAlpha, keyColor),
    upKeyIndex,
  );
}


/*
 * @param keyIndex - the index within the keyPressesVis PIXI object of the key that should be
 *   updated
 * @param newAlpha - the alpha value to set the new key drawing to
 */
function updateKeyDrawing(keyIndex, newAlpha) {
  let x;
  let y;
  switch (keyIndex) {
    case leftKeyIndex:
      x = -(1.5 * keySize) - keyGap;
      y = 0;
      break;
    case downKeyIndex:
      x = -(0.5 * keySize);
      y = 0;
      break;
    case rightKeyIndex:
      x = (0.5 * keySize) + keyGap;
      y = 0;
      break;
    case upKeyIndex:
      x = -(0.5 * keySize);
      y = -keySize - keyGap;
      break;
    default:
      throw new Error(`Given key index does not exist: ${keyIndex}`);
  }
  keyPressesVis.removeChildAt(keyIndex);
  keyPressesVis.addChildAt(
    getPixiSquare(x, y, keySize, newAlpha, keyColor),
    keyIndex,
  );
}


/*
 * Draw the given state of the key presses.
 *
 * @param {Object} directions - directions to draw
 * @param {(string|undefined)} directions.x - either 'RIGHT', 'LEFT', or undefined
 * @param {(string|undefined)} directions.y - either 'DOWN', 'UP', or undefined
 */
export function drawKeyPresses(directions) {
  if (directions.x !== currKeyPresses.x) {
    // Find new alpha values for left/right keys
    const leftAlpha = directions.x === 'LEFT' ? keyOnAlpha : keyOffAlpha;
    const rightAlpha = directions.x === 'RIGHT' ? keyOnAlpha : keyOffAlpha;

    // Update left/right key drawings
    updateKeyDrawing(leftKeyIndex, leftAlpha);
    updateKeyDrawing(rightKeyIndex, rightAlpha);
  }

  if (directions.y !== currKeyPresses.y) {
    // Find new alpha values for down/up keys
    const downAlpha = directions.y === 'DOWN' ? keyOnAlpha : keyOffAlpha;
    const upAlpha = directions.y === 'UP' ? keyOnAlpha : keyOffAlpha;

    // Update down/up key drawings
    updateKeyDrawing(downKeyIndex, downAlpha);
    updateKeyDrawing(upKeyIndex, upAlpha);
  }
}


/*
 * Erases all spirtes in pathSprites from the renderer
 * Creates a new path sprite for each cell in path
 * Adds each new sprite to pathSprites, and to the renderer
 * Runtime: O(A)
 * @param {Array} path - an array of cells, likely returned by getShortestPath()
 */
export function updatePath(path) {
  if (!isVisualMode()) {
    return;
  }
  _.forEach(pathSprites, p => tagpro.renderer.layers.background.removeChild(p));
  pathSprites.splice(0, pathSprites.length);
  _.forEach(path, cell => {
    const sprite = getPixiSquare(cell.xc * PPCL, cell.yc * PPCL, PPCL, pathAlpha, pathColor);
    pathSprites.push(sprite);
    tagpro.renderer.layers.background.addChild(sprite);
  });
}


/*
 * Erases all sprites in pathSprites, tempNTSprites, and permNTSprites.
 * Reassigns pathSprites and tempNTSprites to empty list
 * Runtime: O(N^2)
 */
export function clearSprites() {
  // get a list of all sprites
  const allSprites = permNTSprites
    .concat(pathSprites)
    // flatten the tempNTSprites grid, and remove null values
    // O(N^2), because tempNTSprites is NxN
    .concat(_.reject(_.flatten(tempNTSprites), _.isNull));
  _.forEach(allSprites, s => tagpro.renderer.layers.background.removeChild(s));
  pathSprites = [];
  tempNTSprites = [];
}


/*
 * Iterates over permNTSprites and adds each sprite to the renderer
 * Runtime: O(P)
 */
export function drawPermanentNTSprites() {
  _.forEach(permNTSprites, s => tagpro.renderer.layers.background.addChild(s));
}


/*
 * Iterates over the cells in a single tile in the tagpro map, indexed in the tagpro map at
 * map[x][y].
 * It takes each cell in the corresponding cellTraversabilities grid, and if a cell is NT, creates a
 * new sprite for the cell and stores it in permNTSprites. Assumes that the cellTraversabilities for
 * the input tile have aleady been computed and stored in cellTraversabilities.
 * Runtime: O(CPTL^2)
 */
export function generatePermanentNTSprites(x, y, cellTraversabilities) {
  assertGridInBounds(cellTraversabilities, x * CPTL, y * CPTL);
  assertGridInBounds(cellTraversabilities, ((x + 1) * CPTL) - 1, ((y + 1) * CPTL) - 1);
  for (let i = x * CPTL; i < (x + 1) * CPTL; i++) {
    for (let j = y * CPTL; j < (y + 1) * CPTL; j++) {
      // if we don't have a sprite already there and there should be one,
      // draw it
      if (!cellTraversabilities[i][j]) {
        const sprite = getPixiSquare(i * PPCL, j * PPCL, PPCL, ntAlpha, ntColor);
        permNTSprites.push(sprite);
      }
    }
  }
}


/*
 * Takes in an grid of cellTraversabilities, and the x, y tile location that we should check for
 * updates, and updates the sprites drawn on the tagpro map. If tempNTSprites is empty, initialize
 * it to the correct size as specified by the comment at the top of this file
 * Runtime: O(CPTL^2), O(1) if visualizations off
 *
 * @param {number} xt - x location, in tiles
 * @param {number} yt - y location, in tiles
 * @param {Array} cellTraversabilities - the cell-traversabilities of the tagpro map.
 */
export function updateNTSprites(xt, yt, cellTraversabilities) {
  if (!isVisualMode()) {
    return;
  }
  if (_.isEmpty(tempNTSprites)) {
    tempNTSprites = init2dArray(
      tagpro.map.length * CPTL,
      tagpro.map[0].length * CPTL,
      null,
    );
  }
  for (let i = xt * CPTL; i < (xt + 1) * CPTL; i++) {
    for (let j = yt * CPTL; j < (yt + 1) * CPTL; j++) {
      // if we don't have a sprite already there and there should be one,
      // draw it
      if (_.isNull(tempNTSprites[i][j]) && !cellTraversabilities[i][j]) {
        const sprite = getPixiSquare(i * PPCL, j * PPCL, PPCL, ntAlpha, ntColor);
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

