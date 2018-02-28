import _ from 'lodash';
import {
  ALLY_PATH_COLOR,
  ENEMY_PATH_COLOR,
  NAV_MESH_EDGE_COLOR,
  NAV_MESH_FIXED_EDGE_COLOR,
  NAV_MESH_VERTEX_COLOR,
  NAV_MESH_ALPHA,
  NAV_MESH_FIXED_EDGE_ALPHA,
  NAV_MESH_THICKNESS,
  TRIANGULATION_EDGE_COLOR,
  TRIANGULATION_ALPHA,
  TRIANGULATION_THICKNESS,
} from './constants';
import { dtGraph } from '../interpret/setup';


let allyPolypointPathGraphics = null; // PIXI Graphics for drawing the bot's polypoint path
let enemyPolypointPathGraphics = null; // PIXI Graphics for drawing the enemy polypoint path

// The sprite for the triangulation graph
let triangulationSprite;
// The sprite for the polypoint graph
let polypointSprite;

let trianglesOn = false;
let polypointsOn = false;
let pathsOn = false;


/**
 * @param {PolypointState[]} polypointPath - a list of states that define the path
 */
function drawPolypointPath(polypointPathGraphics, polypointPath, polypointPathColor) {
  polypointPathGraphics.clear();
  polypointPathGraphics.lineStyle(
    TRIANGULATION_THICKNESS + 1,
    polypointPathColor,
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
}


export function drawAllyPolypointPath(polypointPath) {
  if (!pathsOn) return;
  if (!allyPolypointPathGraphics) {
    allyPolypointPathGraphics = new PIXI.Graphics();
    tagpro.renderer.layers.background.addChild(allyPolypointPathGraphics);
  }
  drawPolypointPath(allyPolypointPathGraphics, polypointPath, ALLY_PATH_COLOR);
}


export function drawEnemyPolypointPath(polypointPath) {
  if (!pathsOn) return;
  if (!enemyPolypointPathGraphics) {
    enemyPolypointPathGraphics = new PIXI.Graphics();
    tagpro.renderer.layers.background.addChild(enemyPolypointPathGraphics);
  }
  drawPolypointPath(enemyPolypointPathGraphics, polypointPath, ENEMY_PATH_COLOR);
}


/**
 * @callback edgeStyleFunc
 * @param {Edge} e
 * @returns {{color: number, alpha: number}} a hex color and alpha that the edge should be colored
 */


/*
 * Draws edges and vertices of a graph class with a specified thickness and color. Runtime: O(E)
 * @param {Graph} graph - graph to draw
 * @param {number} thickness - thickness of the lines in pixels
 * @param {number} vertexColor - a hex color
 * @param {number} vertexAlpha - an alpha from 0.0-1.0
 * @param {edgeStyleFunc} getEdgeStyle - a function that returns the color and alpha for each edge.
 * @param {boolean} drawVertices - true if this function should draw the graph's vertices
 */
function getGraphGraphics(
  graph,
  thickness,
  vertexColor,
  vertexAlpha,
  getEdgeStyle,
  drawVertices = true,
) {
  const graphGraphics = new PIXI.Graphics();

  // Keep track of the current lineStyle color and alpha
  let currEdgeColor = null;
  let currAlpha = null;
  graphGraphics.lineStyle(thickness, currEdgeColor, currAlpha);
  _.forEach(graph.getEdges(), edge => {
    // Check which color the edge we're about to draw should be
    const nextEdgeColor = getEdgeStyle(edge).color;
    const nextAlpha = getEdgeStyle(edge).alpha;
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
function drawTriangulation() {
  if (!trianglesOn) return;
  triangulationSprite = triangulationSprite || getGraphGraphics(
    dtGraph,
    NAV_MESH_THICKNESS,
    NAV_MESH_VERTEX_COLOR,
    NAV_MESH_ALPHA,
    e => (
      dtGraph.isEdgeFixed(e) ?
        { color: NAV_MESH_FIXED_EDGE_COLOR, alpha: NAV_MESH_FIXED_EDGE_ALPHA } :
        { color: NAV_MESH_EDGE_COLOR, alpha: NAV_MESH_ALPHA }
    ),
    true,
  );
  tagpro.renderer.layers.foreground.addChild(triangulationSprite);
}


function drawPolypoints() {
  if (!polypointsOn) return;
  polypointSprite = polypointSprite || getGraphGraphics(
    dtGraph.polypoints,
    TRIANGULATION_THICKNESS,
    null,
    TRIANGULATION_ALPHA,
    () => ({ color: TRIANGULATION_EDGE_COLOR, alpha: TRIANGULATION_ALPHA }),
    false,
  );
  tagpro.renderer.layers.foreground.addChild(triangulationSprite);
  tagpro.renderer.layers.foreground.addChild(polypointSprite);
}


function resetTriangulationAndPolypointDrawing() {
  tagpro.renderer.layers.foreground.removeChild(polypointSprite);
  tagpro.renderer.layers.foreground.removeChild(triangulationSprite);
  triangulationSprite = null;
  polypointSprite = null;
}


export function toggleTriangulationVis(setTo = !trianglesOn) {
  if (setTo === trianglesOn) return;
  trianglesOn = setTo;
  if (!trianglesOn) {
    tagpro.renderer.layers.foreground.removeChild(triangulationSprite);
  } else {
    drawTriangulation();
  }
}


export function togglePolypointVis(setTo = !polypointsOn) {
  if (setTo === polypointsOn) return;
  polypointsOn = setTo;
  if (!polypointsOn) {
    tagpro.renderer.layers.foreground.removeChild(polypointSprite);
  } else {
    drawPolypoints();
  }
}


export function togglePathVis(setTo = !pathsOn) {
  if (setTo === pathsOn) return;
  pathsOn = setTo;
  if (!pathsOn) {
    allyPolypointPathGraphics.clear();
    enemyPolypointPathGraphics.clear();
  }
}


/**
 * Redraw the triangulation and polypoints
 */
export function redrawNavMesh() {
  resetTriangulationAndPolypointDrawing();
  drawTriangulation();
  drawPolypoints();
}
