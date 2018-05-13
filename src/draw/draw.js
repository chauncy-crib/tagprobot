import { centerKeyPressesVis, toggleKeyPressVis } from './keys';
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
export function getPixiRect(xp, yp, alpha, color, width, height = width) {
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
 * The tagpro object has a function that is called every time the user interface needs to be
 *   updated (this function is defined at tagpro.ui.update). We have made additions to the UI that
 *   now need to be updated along with the rest of the builtin TagPro UI. This initUiUpdateFunction
 *   function appends our own custom commands to the tagpro builtin UI update commands.
 */
export function initUiUpdateFunction() {
  const updateUi = tagpro.ui.update;
  tagpro.ui.update = () => {
    updateUi();
    centerKeyPressesVis();
  };
}


export function clearSprites() {
  toggleKeyPressVis(false);
  toggleTriangulationVis(false);
  togglePolypointVis(false);
  togglePathVis(false);
}


export function turnOnAllDrawings() {
  toggleKeyPressVis(true);
  toggleTriangulationVis(true);
  togglePathVis(true);
}
