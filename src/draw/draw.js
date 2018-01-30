import { centerKeyPressesVis, toggleKeyPressVis } from './keys';
import { toggleTraversabilityVis } from './traversability';
import { toggleTriangulationVis, togglePolypointVis, togglePathVis } from './triangulation';


/**
 * @param {number} xp - top left x, in pixels
 * @param {number} yp - top left y, in pixels
 * @param {number} width - width in pixels
 * @param {number} height - height in pixels
 * @param {number} alpha - 0-1, where 0 is transparent
 * @param {number} color - a hex color
 * @returns {PIXI.Graphics} a PIXI.Graphics rectangle object with the specified x, y, width, height,
 *   alpha, and color
 */
export function getPixiRect(xp, yp, width, height, alpha, color) {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(color).drawRect(
    xp,
    yp,
    width,
    height,
  ).alpha = alpha;
  return graphics;
}


/**
 * @param {number} xp - top left x, in pixels
 * @param {number} yp - top left y, in pixels
 * @param {number} size - side length in pixels
 * @param {number} alpha - 0-1, where 0 is transparent
 * @param {number} color - a hex color
 * @returns {PIXI.Graphics} a PIXI.Graphics rectangle object with the specified x, y, size,
 *   alpha, and color
 */
export function getPixiSquare(xp, yp, size, alpha, color) {
  return getPixiRect(xp, yp, size, size, alpha, color);
}

/**
 * The tagpro object has a function that is called every time the user interface needs to be
 *   updated (this function is defined at tagpro.ui.update). We have made additions to the UI that
 *   now need to be updated along with the rest of the builtin TagPro UI. This initUiUpdateProcess
 *   function appends our own custom commands to the tagpro builtin UI update commands.
 */
export function initUiUpdateProcess() {
  const updateUi = tagpro.ui.update;
  tagpro.ui.update = () => {
    updateUi();
    centerKeyPressesVis();
  };
}


/**
 * Erases all sprites in pathSprites, tempNTSprites, and permNTSprites. Reassigns pathSprites and
 *   tempNTSprites to empty list. Runtime: O(N^2)
 */
export function clearSprites() {
  toggleKeyPressVis(false);
  toggleTraversabilityVis(false);
  toggleTriangulationVis(false);
  togglePolypointVis(false);
  togglePathVis(false);
}


export function turnOnAllDrawings() {
  toggleTraversabilityVis(true);
  toggleKeyPressVis(true);
  toggleTriangulationVis(true);
  togglePolypointVis(true);
  togglePathVis(true);
}
