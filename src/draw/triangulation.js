import _ from 'lodash';

import { COLORS, ALPHAS, THICKNESSES } from './constants';
import { getDTGraph } from '../interpret/interpret';


let allyPathGraphics = null; // PIXI Graphics for drawing the bot's polypoint path
let enemyPathGraphics = null; // PIXI Graphics for drawing the enemy polypoint path

let trianglesOn = false;
let polypointsOn = false;
let pathsOn = false;


/**
 * @param {PolypointState[]} path - a list of states that define the path
 */
function drawPath(pathGraphics, path, pathColor) {
  pathGraphics.clear();
  pathGraphics.lineStyle(
    THICKNESSES.path,
    pathColor,
    ALPHAS.path,
  );
  let prevPoint;
  _.forEach(path, p => {
    if (prevPoint) {
      pathGraphics
        .moveTo(prevPoint.point.x, prevPoint.point.y)
        .lineTo(p.point.x, p.point.y);
    }
    prevPoint = p;
  });
}


export function drawAllyPath(path) {
  if (!pathsOn) return;
  if (!allyPathGraphics) {
    allyPathGraphics = new PIXI.Graphics();
    tagpro.renderer.layers.background.addChild(allyPathGraphics);
  }
  drawPath(allyPathGraphics, path, COLORS.path.ally);
}


export function drawEnemyPath(path) {
  if (!pathsOn) return;
  if (!enemyPathGraphics) {
    enemyPathGraphics = new PIXI.Graphics();
    tagpro.renderer.layers.background.addChild(enemyPathGraphics);
  }
  drawPath(enemyPathGraphics, path, COLORS.path.enemy);
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
    getDTGraph().polypoints.turnOffDrawings();
  } else {
    getDTGraph().polypoints.turnOnDrawings();
  }
}


export function togglePathVis(setTo = !pathsOn) {
  if (setTo === pathsOn) return;
  pathsOn = setTo;
  if (!pathsOn) {
    allyPathGraphics.clear();
    enemyPathGraphics.clear();
  }
}
