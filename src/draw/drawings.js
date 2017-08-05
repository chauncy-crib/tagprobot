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
import { PIXELS_PER_TILE } from '../constants';
import { areVisualsOn } from '../utils/interface';
import { clearSprites, drawSprites } from './utils';

let pathSprites = [];
let nonTraversableCellSprites = [];

/*
 * Takes in an array of cells, and creates an array of PIXI.Graphics objects (which the tagpro API
 * knows how to draw) and returns them
 *
 * See: http://pixijs.download/dev/docs/PIXI.Graphics.html
 *
 * @param path: an array of cells, each with an x and y coordinate
 * @param cpt: cells per tile, as defined throughout project
 * @param hexColor: the color the sprites should be
 * @param alpha: the opacity of the path drawing, 0-1. 1 = opaque.
 */
export function createPathSprites(path, cpt, hexColor, alpha) {
  const sprites = []; // initialize global object used for storage of PIXI.Graphics
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
    sprites.push(rect);
  });
  return sprites;
}

/*
 * Takes in an grid of cells, and creates an array of PIXI.Graphics objects for each non-traversable
 * object and returns them.
 *
 * @param traversableCells: an grid of cells
 * @param cpt: cells per tile, as defined throughout project
 * @param notTraversableColor: the color the sprites should be
 * @param alpha: the opacity: 0-1. 1 = opaque.
 */
function createNonTraversableCellSprites(
  traversableCells, cpt, notTraversableColor, alpha) {
  const sprites = [];
  const pixelsPerCell = PIXELS_PER_TILE / cpt;
  for (let x = 0; x < traversableCells.length; x++) {
    for (let y = 0; y < traversableCells[0].length; y++) {
      // if cell is non traversable and not an empty space
      if (!traversableCells[x][y]) {
        const rect = new PIXI.Graphics();
        rect.beginFill(notTraversableColor).drawRect(
          x * pixelsPerCell, // x coordinate
          y * pixelsPerCell, // y coordinate
          pixelsPerCell, // width
          pixelsPerCell, // height
        ).alpha = alpha;
        sprites.push(rect);
      }
    }
  }
  return sprites;
}

/*
 * Used to draw the bot's planned path. Takes in a reference to a list of cells returned by
 * getShortestPath() in helpers/path.js and the cpt used when calculating shortest path, and draws
 * the corresponding cells in green on the map.
 */
export function drawPlannedPath(path, cpt, hexColor = 0x00ff00, alpha = 0.25) {
  pathSprites = clearSprites(pathSprites); // clear the previous path from the map
  if (areVisualsOn()) {
    // create the PIXI.Graphics objecs we're drawing
    pathSprites = createPathSprites(path, cpt, hexColor, alpha);
  }
  drawSprites(pathSprites); // put the PIXI.Graphics objects on the map
}

export function drawNonTraversableCells(traversableCells, cpt, notTraversableColor = 0xff8c00,
  alpha = 0.4) {
  nonTraversableCellSprites = clearSprites(nonTraversableCellSprites);
  if (areVisualsOn()) {
    nonTraversableCellSprites = createNonTraversableCellSprites(traversableCells, cpt,
      notTraversableColor, alpha);
  }
  drawSprites(nonTraversableCellSprites);
}
