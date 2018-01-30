import { getPixiSquare } from './draw';
import { KEY_COLOR, KEY_ON_ALPHA, KEY_OFF_ALPHA } from '../constants';


let keyPressOn = false;

// The current state of the keys being pressed
export const currKeyPresses = { x: null, y: null };
let keyPressesVis; // PIXI Graphics for drawing the key press visualizations
// Index of specific keys inside of the keyPressesVis children array
const leftKeyIndex = 0;
const downKeyIndex = 1;
const rightKeyIndex = 2;
const upKeyIndex = 3;
const keySize = 30; // side length of keys in pixels
const keyGap = 4; // gap between keys in pixels


/**
 * Places the key presses visualization in the correct spot relative to the current screen size.
 *   This is used to correct the placement of the key presses visualization if the user dynamically
 *   resized their screen.
 */
export function centerKeyPressesVis() {
  const viewport = $('#viewport');
  const screenWidth = viewport.width();
  const screenHeight = viewport.height();

  keyPressesVis.x = screenWidth / 2; // in the middle of the screen
  keyPressesVis.y = screenHeight - keySize - 60; // just above the game timer
}


/**
 * Removes all children from the global keyPressesVis and draws the visualization to look like no
 *   keys are being pressed.
 */
export function drawBlankKeyPresses() {
  if (!keyPressesVis) {
    keyPressesVis = new PIXI.Graphics();
    tagpro.renderer.layers.ui.addChild(keyPressesVis);
  }

  keyPressesVis.removeChildren();
  keyPressesVis.addChildAt(
    getPixiSquare(-(1.5 * keySize) - keyGap, 0, keySize, KEY_OFF_ALPHA, KEY_COLOR),
    leftKeyIndex,
  );
  keyPressesVis.addChildAt(
    getPixiSquare(-(0.5 * keySize), 0, keySize, KEY_OFF_ALPHA, KEY_COLOR),
    downKeyIndex,
  );
  keyPressesVis.addChildAt(
    getPixiSquare((0.5 * keySize) + keyGap, 0, keySize, KEY_OFF_ALPHA, KEY_COLOR),
    rightKeyIndex,
  );
  keyPressesVis.addChildAt(
    getPixiSquare(-(0.5 * keySize), -keySize - keyGap, keySize, KEY_OFF_ALPHA, KEY_COLOR),
    upKeyIndex,
  );
  // Set currKeyPresses to reflect the state of the drawing
  currKeyPresses.x = null;
  currKeyPresses.y = null;
}


/**
 * @param {number} keyIndex - the index within the keyPressesVis PIXI object of the key that should
 *   be updated
 * @param {number} newAlpha - the alpha value to set the new key drawing to
 */
function updateKeyPressesDrawing(keyIndex, newAlpha) {
  let xp;
  let yp;
  switch (keyIndex) {
    case leftKeyIndex:
      xp = -(1.5 * keySize) - keyGap;
      yp = 0;
      break;
    case downKeyIndex:
      xp = -(0.5 * keySize);
      yp = 0;
      break;
    case rightKeyIndex:
      xp = (0.5 * keySize) + keyGap;
      yp = 0;
      break;
    case upKeyIndex:
      xp = -(0.5 * keySize);
      yp = -keySize - keyGap;
      break;
    default:
      throw new Error(`Given key index does not exist: ${keyIndex}`);
  }
  keyPressesVis.removeChildAt(keyIndex);
  keyPressesVis.addChildAt(
    getPixiSquare(xp, yp, keySize, newAlpha, KEY_COLOR),
    keyIndex,
  );
}


/**
 * Draw the given state of the key presses.
 * @param {Object} directions - directions to draw
 * @param {(string|undefined)} directions.x - either 'RIGHT', 'LEFT', or undefined
 * @param {(string|undefined)} directions.y - either 'DOWN', 'UP', or undefined
 */
export function drawKeyPresses(directions) {
  if (!keyPressOn) return;
  if (directions.x !== currKeyPresses.x) {
    // Find new alpha values for left/right keys
    const leftAlpha = directions.x === 'LEFT' ? KEY_ON_ALPHA : KEY_OFF_ALPHA;
    const rightAlpha = directions.x === 'RIGHT' ? KEY_ON_ALPHA : KEY_OFF_ALPHA;

    // Update left/right key drawings
    updateKeyPressesDrawing(leftKeyIndex, leftAlpha);
    updateKeyPressesDrawing(rightKeyIndex, rightAlpha);
  }

  if (directions.y !== currKeyPresses.y) {
    // Find new alpha values for down/up keys
    const downAlpha = directions.y === 'DOWN' ? KEY_ON_ALPHA : KEY_OFF_ALPHA;
    const upAlpha = directions.y === 'UP' ? KEY_ON_ALPHA : KEY_OFF_ALPHA;

    // Update down/up key drawings
    updateKeyPressesDrawing(downKeyIndex, downAlpha);
    updateKeyPressesDrawing(upKeyIndex, upAlpha);
  }
}


export function toggleKeyPressVis(setTo = !keyPressOn) {
  if (setTo === keyPressOn) return;
  keyPressOn = setTo;
  if (!keyPressOn) {
    keyPressesVis.removeChildren();
  } else {
    drawBlankKeyPresses();
  }
}
