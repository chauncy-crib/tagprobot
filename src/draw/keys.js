import { assert } from '../global/utils';
import { currKeyPresses } from '../interface/keys';
import { KEY_COLOR, KEY_ON_ALPHA, KEY_OFF_ALPHA } from './constants';
import { getPixiRect } from './draw';


let keyPressOn = false;

let keyPressesVis; // PIXI Graphics for drawing the key press visualizations
// Index of specific keys inside of the keyPressesVis children array
const KEY_INDICES = {
  left: 0,
  down: 1,
  right: 2,
  up: 3,
};
const KEY_SIZE = 30; // side length of keys in pixels
const KEY_GAP = 4; // gap between keys in pixels


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
  keyPressesVis.y = screenHeight - KEY_SIZE - 60; // just above the game timer
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
    getPixiRect(-(1.5 * KEY_SIZE) - KEY_GAP, 0, KEY_OFF_ALPHA, KEY_COLOR, KEY_SIZE),
    KEY_INDICES.left,
  );
  keyPressesVis.addChildAt(
    getPixiRect(-(0.5 * KEY_SIZE), 0, KEY_OFF_ALPHA, KEY_COLOR, KEY_SIZE),
    KEY_INDICES.down,
  );
  keyPressesVis.addChildAt(
    getPixiRect((0.5 * KEY_SIZE) + KEY_GAP, 0, KEY_OFF_ALPHA, KEY_COLOR, KEY_SIZE),
    KEY_INDICES.right,
  );
  keyPressesVis.addChildAt(
    getPixiRect(-(0.5 * KEY_SIZE), -KEY_SIZE - KEY_GAP, KEY_OFF_ALPHA, KEY_COLOR, KEY_SIZE),
    KEY_INDICES.up,
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
    case KEY_INDICES.left:
      xp = -(1.5 * KEY_SIZE) - KEY_GAP;
      yp = 0;
      break;
    case KEY_INDICES.down:
      xp = -(0.5 * KEY_SIZE);
      yp = 0;
      break;
    case KEY_INDICES.right:
      xp = (0.5 * KEY_SIZE) + KEY_GAP;
      yp = 0;
      break;
    case KEY_INDICES.up:
      xp = -(0.5 * KEY_SIZE);
      yp = -KEY_SIZE - KEY_GAP;
      break;
    default:
      assert(false, `Given key index does not exist: ${keyIndex}`);
  }
  keyPressesVis.removeChildAt(keyIndex);
  keyPressesVis.addChildAt(
    getPixiRect(xp, yp, newAlpha, KEY_COLOR, KEY_SIZE),
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
    updateKeyPressesDrawing(KEY_INDICES.left, leftAlpha);
    updateKeyPressesDrawing(KEY_INDICES.right, rightAlpha);
  }

  if (directions.y !== currKeyPresses.y) {
    // Find new alpha values for down/up keys
    const downAlpha = directions.y === 'DOWN' ? KEY_ON_ALPHA : KEY_OFF_ALPHA;
    const upAlpha = directions.y === 'UP' ? KEY_ON_ALPHA : KEY_OFF_ALPHA;

    // Update down/up key drawings
    updateKeyPressesDrawing(KEY_INDICES.down, downAlpha);
    updateKeyPressesDrawing(KEY_INDICES.up, upAlpha);
  }
}


export function toggleKeyPressVis(setTo = !keyPressOn) {
  if (setTo === keyPressOn) return;
  keyPressOn = setTo;
  if (!keyPressOn) keyPressesVis.removeChildren();
  else drawBlankKeyPresses();
}
