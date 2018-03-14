import _ from 'lodash';

import { COLORS, ALPHAS, THICKNESSES } from './constants';
import { getDTGraph } from '../interpret/setup';


let allyPolypointPathGraphics = null; // PIXI Graphics for drawing the bot's polypoint path
let enemyPolypointPathGraphics = null; // PIXI Graphics for drawing the enemy polypoint path

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
    THICKNESSES.triangulation + 1,
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
  drawPolypointPath(allyPolypointPathGraphics, polypointPath, COLORS.path.ally);
}


export function drawEnemyPolypointPath(polypointPath) {
  if (!pathsOn) return;
  if (!enemyPolypointPathGraphics) {
    enemyPolypointPathGraphics = new PIXI.Graphics();
    tagpro.renderer.layers.background.addChild(enemyPolypointPathGraphics);
  }
  drawPolypointPath(enemyPolypointPathGraphics, polypointPath, COLORS.path.enemy);
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


function drawPolypoints() {
  if (!polypointsOn) return;
  polypointSprite = polypointSprite || getGraphGraphics(
    getDTGraph().polypoints,
    THICKNESSES.triangulation,
    null,
    ALPHAS.triangulation.vertex,
    () => ({ color: COLORS.triangulation.edge, alpha: ALPHAS.triangulation.edge }),
    false,
  );
  tagpro.renderer.layers.foreground.addChild(polypointSprite);
}


export function toggleTriangulationVis(setTo = !trianglesOn) {
  if (setTo === trianglesOn) return;
  trianglesOn = setTo;
  if (!trianglesOn) {
    getDTGraph().turnOffDrawings();
  } else {
    getDTGraph().turnOnDrawings();
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
