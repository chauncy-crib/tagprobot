import _ from 'lodash';

import { COLORS, THICKNESSES } from './constants';
import { getDTGraph } from '../interpret/setup';


let allyPolypointPathGraphics = null; // PIXI Graphics for drawing the bot's polypoint path
let enemyPolypointPathGraphics = null; // PIXI Graphics for drawing the enemy polypoint path

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
    allyPolypointPathGraphics.clear();
    enemyPolypointPathGraphics.clear();
  }
}
