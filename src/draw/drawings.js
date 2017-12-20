import _ from 'lodash';
import {
  PPCL,
  CPTL,
  PATH_ALPHA,
  ALLY_PATH_COLOR,
  ENEMY_PATH_COLOR,
  NT_ALPHA,
  NT_COLOR,
  KEY_COLOR,
  KEY_ON_ALPHA,
  KEY_OFF_ALPHA,
  NAV_MESH_EDGE_COLOR,
  NAV_MESH_VERTEX_COLOR,
  NAV_MESH_ALPHA,
  NAV_MESH_THICKNESS,
  TRIANGULATION_EDGE_COLOR,
  TRIANGULATION_ALPHA,
  TRIANGULATION_THICKNESS,
} from '../constants';
import { getDTGraph } from '../navmesh/triangulation';
import { isVisualMode } from '../utils/interface';
import { assertGridInBounds } from '../utils/asserts';
import { init2dArray } from '../utils/mapUtils';


let allyCellPathGraphics = null; // PIXI Graphics for drawing the bot's current planned path
let enemyCellPathGraphics = null; // PIXI Graphics for drawing the predicted enemy path
let polypointPathGraphics = null; // PIXI Graphics for drawing the polypoint path
// A grid of NT-sprites, which are subject to change. If there isn't a NT-object at the given cell,
//   then store null. This object is size tagpro_map_length * CPTL x tagpro_map_width * CPTL
let tempNTSprites = [];
let tempNTSpritesDrawn = false;

// The permanent NT sprite. Will always be on map (if visualizations are on)
let permNTSprite;
// The sprite for the triangulation graph
let triangulationSprite;
// The sprite for the polypoint graph
let polypointSprite;

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
 * @param {number} xp - top left x, in pixels
 * @param {number} yp - top left y, in pixels
 * @param {number} width - width in pixels
 * @param {number} height - height in pixels
 * @param {number} alpha - 0-1, where 0 is transparent
 * @param {number} color - a hex color
 * @returns {PIXI.Graphics} a PIXI.Graphics rectangle object with the specified x, y, width, height,
 *   alpha, and color
 */
function getPixiRect(xp, yp, width, height, alpha, color) {
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
function getPixiSquare(xp, yp, size, alpha, color) {
  return getPixiRect(xp, yp, size, size, alpha, color);
}


/**
 * Places the key presses visualization in the correct spot relative to the current screen size.
 *   This is used to correct the placement of the key presses visualization if the user dynamically
 *   resized their screen.
 */
function centerKeyPressesVis() {
  const viewport = $('#viewport');
  const screenWidth = viewport.width();
  const screenHeight = viewport.height();

  keyPressesVis.x = screenWidth / 2; // in the middle of the screen
  keyPressesVis.y = screenHeight - keySize - 60; // just above the game timer
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


/**
 * Erases cellPathGraphics from the renderer. Creates a new path sprite for each cell in
 *   path. Adds each new sprite to pathSprites, and to the renderer. Runtime: O(A)
 * @param {PIXI.Graphics} cellPathGraphics - the PIXI Graphics object to update
 * @param {GameState[]} cellPath - an array of GameStates, likely returned by getShortestPath()
 * @param cellPathColor - the color to make the rendered path
 */
function drawCellPath(cellPathGraphics, cellPath, cellPathColor) {
  cellPathGraphics.removeChildren();
  _.forEach(cellPath, cell => {
    cellPathGraphics.addChild(getPixiSquare(
      cell.xc * PPCL,
      cell.yc * PPCL,
      PPCL,
      PATH_ALPHA,
      cellPathColor,
    ));
  });
}


/**
 * Helper function to call drawCellPath() while modifying the correct global Graphics object.
 * @param {GameState[]} cellPath - an array of GameStates, likely returned by getShortestPath()
 */
export function drawAllyCellPath(cellPath) {
  if (!isVisualMode()) return;
  if (!allyCellPathGraphics) {
    allyCellPathGraphics = new PIXI.Graphics();
    tagpro.renderer.layers.background.addChild(allyCellPathGraphics);
  }
  drawCellPath(allyCellPathGraphics, cellPath, ALLY_PATH_COLOR);
}


/**
 * Helper function to call drawCellPath() while modifying the correct global Graphics object.
 * @param {GameState[]} cellPath - an array of GameStates, likely returned by getShortestPath()
 */
export function drawEnemyCellPath(cellPath) {
  if (!isVisualMode()) return;
  if (!enemyCellPathGraphics) {
    enemyCellPathGraphics = new PIXI.Graphics();
    tagpro.renderer.layers.background.addChild(enemyCellPathGraphics);
  }
  drawCellPath(enemyCellPathGraphics, cellPath, ENEMY_PATH_COLOR);
}


/**
 * @param {PolypointState[]} polypointPath - a list of states that define the path
 */
export function drawPolypointPath(polypointPath) {
  if (!isVisualMode()) return;
  tagpro.renderer.layers.background.removeChild(polypointPathGraphics);
  polypointPathGraphics = new PIXI.Graphics();
  polypointPathGraphics.lineStyle(
    TRIANGULATION_THICKNESS + 1,
    TRIANGULATION_EDGE_COLOR,
    1,
  );
  let prevPoint;
  _.forEach(polypointPath, p => {
    if (prevPoint) {
      polypointPathGraphics
        .moveTo(prevPoint.point.x, prevPoint.point.y)
        .lineTo(p.point.x, p.point.y);
    }
    prevPoint = p;
  });
  tagpro.renderer.layers.background.addChild(polypointPathGraphics);
}


/**
 * Erases all sprites in pathSprites, tempNTSprites, and permNTSprites. Reassigns pathSprites and
 *   tempNTSprites to empty list. Runtime: O(N^2)
 */
export function clearSprites() {
  if (keyPressesVis) keyPressesVis.removeChildren();
  if (allyCellPathGraphics) allyCellPathGraphics.removeChildren();
  if (enemyCellPathGraphics) enemyCellPathGraphics.removeChildren();

  // Get a list of all sprites
  const backgroundSprites = [permNTSprite]
    .concat(polypointPathGraphics)
    // Flatten the tempNTSprites grid, and remove null values. O(N^2), because tempNTSprites is NxN
    .concat(_.reject(_.flatten(tempNTSprites), _.isNull));
  _.forEach(backgroundSprites, s => tagpro.renderer.layers.background.removeChild(s));
  const foregroundSprites = []
    .concat(triangulationSprite || [])
    .concat(polypointSprite || []);
  _.forEach(foregroundSprites, s => tagpro.renderer.layers.foreground.removeChild(s));
  tempNTSprites = [];
  tempNTSpritesDrawn = false;
}


/**
 * Adds the permNTSprite to the renderer. Runtime: O(1)
 */
export function drawPermanentNTSprites() {
  tagpro.renderer.layers.background.addChild(permNTSprite);
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

/**
 * @callback edgeStyleFunc
 * @param {{p1: Point, p2: Point}} e - an edge object
 * @returns {{color: number, alpha: number}} a hex color and alpha that the edge should be colored
 */


/*
 * Draws edges and vertices of a graph class with a specified thickness and color. Runtime: O(E)
 * @param {Graph} graph - graph to draw
 * @param {number} thickness - thickness of the lines in pixels
 * @param {number} vertexColor - a hex color
 * @param {number} vertexAlpha - an alpha from 0.0-1.0
 * @param {edgeStyleFunc} edgeStyle - a function that returns the color each edge should be.
 * @param {boolean} drawVertices - true if this function should draw the graph's vertices
 */
function getGraphGraphics(
  graph,
  thickness,
  vertexColor,
  vertexAlpha,
  edgeColor,
  drawVertices = true,
) {
  const graphGraphics = new PIXI.Graphics();

  // Keep track of the current lineStyle color
  let currEdgeColor = null;
  let currAlpha = null;
  graphGraphics.lineStyle(thickness, edgeColor, currAlpha);
  _.forEach(graph.getEdges(), edge => {
    // Check which color the edge we're about to draw should be
    const nextEdgeColor = edgeColor(edge).color;
    const nextAlpha = edgeColor(edge).alpha;
    if (nextEdgeColor !== currEdgeColor || nextAlpha !== currAlpha) {
      // Update the color of graphGraphics if needed
      graphGraphics.lineStyle(thickness, nextEdgeColor, nextAlpha);
      currEdgeColor = nextEdgeColor;
      currAlpha = nextAlpha;
    }
    graphGraphics.moveTo(edge.p1.x, edge.p1.y).lineTo(edge.p2.x, edge.p2.y);
  });

  if (drawVertices) {
    graphGraphics.lineStyle(thickness, vertexColor, vertexAlpha);
    _.forEach(graph.getVertices(), vertex => {
      graphGraphics.drawCircle(vertex.x, vertex.y, thickness);
    });
  }

  return graphGraphics;
}


/*
 * Draws the navigation mesh lines on the tagpro map. Runtime: O(E), O(1) if visualizations off
 */
export function drawNavMesh() {
  if (!isVisualMode()) return;
  if (triangulationSprite) tagpro.renderer.layers.foreground.removeChild(triangulationSprite);
  if (polypointSprite) tagpro.renderer.layers.foreground.removeChild(polypointSprite);

  triangulationSprite = getGraphGraphics(
    getDTGraph(),
    NAV_MESH_THICKNESS,
    NAV_MESH_VERTEX_COLOR,
    NAV_MESH_ALPHA,
    e => (
      getDTGraph().hasFixedEdge(e) ?
        { color: 0x42aaf4, alpha: 1 } :
        { color: NAV_MESH_EDGE_COLOR, alpha: NAV_MESH_ALPHA }
    ),
    true,
  );
  polypointSprite = getGraphGraphics(
    getDTGraph().polypoints,
    TRIANGULATION_THICKNESS,
    null,
    TRIANGULATION_ALPHA,
    () => ({ color: TRIANGULATION_EDGE_COLOR, alpha: TRIANGULATION_ALPHA }),
    false,
  );
  tagpro.renderer.layers.foreground.addChild(triangulationSprite);
  tagpro.renderer.layers.foreground.addChild(polypointSprite);
}

export function areTempNTSpritesDrawn() {
  return tempNTSpritesDrawn;
}

export function setNTSpritesDrawn(b) {
  tempNTSpritesDrawn = b;
}
