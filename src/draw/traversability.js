import _ from 'lodash';
import { getPixiSquare } from './draw';
import { PPCL, CPTL, NT_COLOR, NT_ALPHA } from '../constants';
import { assertGridInBounds } from '../utils/asserts';
import { init2dArray } from '../utils/mapUtils';


// A grid of NT-sprites, which are subject to change. If there isn't a NT-object at the given cell,
//   then store null. This object is size tagpro_map_length * CPTL x tagpro_map_width * CPTL
let tempNTSprites = [];
let tempNTSpritesDrawn = false;

// The permanent NT sprite. Will always be on map (if visualizations are on)
let permNTSprite;

let traversabilityOn = false;


/**
 * Adds the permNTSprite to the renderer. Runtime: O(1)
 */
export function drawPermanentNTSprites() {
  tagpro.renderer.layers.background.addChild(permNTSprite);
}


export function toggleTraversabilityVis(setTo = !traversabilityOn) {
  if (setTo === traversabilityOn) return;
  traversabilityOn = setTo;
  if (!traversabilityOn) {
    const backgroundSprites = []
      .concat(permNTSprite || [])
      // Flatten the tempNTSprites grid, and remove null values. O(N^2), b/c tempNTSprites is NxN
      .concat(_.reject(_.flatten(tempNTSprites), _.isNull));
    _.forEach(backgroundSprites, s => {
      tagpro.renderer.layers.background.removeChild(s);
    });
    tempNTSprites = [];
    tempNTSpritesDrawn = false;
  } else {
    drawPermanentNTSprites();
  }
}


/**
 * Iterates over the cells in a single tile in the tagpro map, indexed in the tagpro map at
 *   map[x][y]. It takes each cell in the corresponding cellTraversabilities grid, and if a cell is
 *   NT, creates a new sprite for the cell and stores it in permNTSprites. Assumes that the
 *   cellTraversabilities for the input tile have aleady been computed and stored in
 *   cellTraversabilities. Runtime: O(CPTL^2)
 */
export function generatePermanentNTSprites(xt, yt, cellTraversabilities) {
  assertGridInBounds(cellTraversabilities, xt * CPTL, yt * CPTL);
  assertGridInBounds(cellTraversabilities, ((xt + 1) * CPTL) - 1, ((yt + 1) * CPTL) - 1);
  permNTSprite = permNTSprite || new PIXI.Graphics();
  for (let i = xt * CPTL; i < (xt + 1) * CPTL; i++) {
    for (let j = yt * CPTL; j < (yt + 1) * CPTL; j++) {
      // If we don't have a sprite already there and there should be one,
      //   draw it
      if (!cellTraversabilities[i][j]) {
        permNTSprite.beginFill(NT_COLOR).drawRect(
          i * PPCL,
          j * PPCL,
          PPCL,
          PPCL,
        ).alpha = NT_ALPHA;
      }
    }
  }
}


/**
 * Takes in an grid of cellTraversabilities, and the x, y tile location that we should check for
 *   updates, and updates the sprites drawn on the tagpro map. If tempNTSprites is empty, initialize
 *   it to the correct size as specified by the comment at the top of this file. Runtime: O(CPTL^2),
 *   O(1) if visualizations off
 * @param {number} xt - x location, in tiles
 * @param {number} yt - y location, in tiles
 * @param {number[][]} cellTraversabilities - the cell-traversabilities of the tagpro map.
 */
export function updateNTSprites(xt, yt, cellTraversabilities) {
  if (!traversabilityOn) {
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
        const sprite = getPixiSquare(i * PPCL, j * PPCL, PPCL, NT_ALPHA, NT_COLOR);
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


export function isTraversabilityOn() {
  return traversabilityOn;
}


export function areTempNTSpritesDrawn() {
  return tempNTSpritesDrawn;
}


export function setNTSpritesDrawn(b) {
  tempNTSpritesDrawn = b;
}
