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
 * of which take a reference to the object being drawn/removed. We use the tagpro global object to
 * store the objects currently draw on the screen in an array: `tagpro.rendered.pathSprites` (this
 * was from line 21 of the referenced userscript). Then, before drawing the path, we erase any path
 * that was previously drawn.
 */
import { PIXELS_PER_TILE } from '../constants';

/*
 * Takes in an array of cells, and creates an array of PIXI.Graphics objects (which the tagpro API
 * knows how to draw) and stores them in the global tagpro.renderer.pathSprites object.
 *
 * See: http://pixijs.download/dev/docs/PIXI.Graphics.html
 *
 * @param path: an array of cells, each with an x and y coordinate
 * @param cpt: cells per tile, as defined throughout project
 * @param hexColor: the color the sprites should be
 * @param alpha: the opacity of the path drawing, 0-1. 1 = opaque.
 */
function createPathSprites(path, cpt, hexColor, alpha) {
  tagpro.renderer.pathSprites = []; // initialize global object used for storage of PIXI.Graphics
  const pixelsPerCell = PIXELS_PER_TILE / cpt; // dimensional analysis
  path.forEach(cell => { // create a PIXI.Graphics object for each cell in the path
    // note: all units in pixels
    const rect = new PIXI.Graphics();
    rect.beginFill(hexColor).drawRect(
      cell.x * pixelsPerCell, // x coordinate
      cell.y * pixelsPerCell, // y coordinate
      pixelsPerCell, // width
      pixelsPerCell, // height
    ).alpha = alpha;
    tagpro.renderer.pathSprites.push(rect);
  });
}

/*
 * If tagpro.renderer.pathSprites has been initialized, iterate through each stored object and
 * remove it from the background. Used for removing the drawing of the previous path from the map.
 */
function clearRects() {
  if (tagpro.renderer.pathSprites) {
    tagpro.renderer.pathSprites.forEach(sprite => {
      tagpro.renderer.layers.background.removeChild(sprite);
    });
  }
}

/*
 * Iterates over each PIXI.Graphics object in tagpro.renderer.pathSprites and adds it to the
 * background
 */
function drawRects() {
  tagpro.renderer.pathSprites.forEach(sprite => {
    tagpro.renderer.layers.background.addChild(sprite);
  });
}

/*
 * Used to draw the bot's planned path. Takes in a reference to a list of cells returned by
 * getShortestPath() in helpers/path.js and the cpt used when calculating shortest path, and draws
 * the corresponding cells in green on the map.
 */
export default function drawPlannedPath(path, renderer, cpt, hexColor = 0x00ff00, alpha = 0.25) {
  clearRects(); // clear the previous path from the map
  createPathSprites(path, cpt, hexColor, alpha); // create the PIXI.Graphics objecs we're drawing
  drawRects(); // put the PIXI.Graphics objects on the map
}
