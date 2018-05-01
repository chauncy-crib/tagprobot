import _ from 'lodash';

import { BRP } from '../global/constants';
import {
  amRed,
  amBlue,
  getEnemyGoal,
  isCenterFlag,
  myTeamHasFlag,
  enemyTeamHasFlag,
} from '../look/gameState';
import { findCachedTile, findEnemyFC } from '../look/tileLocations';
import { getShortestPolypointPath } from '../plan/astar';
import { Point } from '../interpret/class/Point';
import { funnelPolypoints } from '../plan/funnel';
import { getDTGraph } from '../interpret/setup';


/**
 * @param {{point: {x: number, y: number}}[]} path - a list of objects with a point key.
 * @param {number} granularity - the euclidian distance the points along the path should be
 *   separated by.
 * @returns {{x: number, y: number}[]} a list of points along the path. These points result from
 *   connecting each point in the input path, then placing points along each line, separated by
 *   granularity
 */
function getPointsAlongPath(path, granularity = 40) {
  const res = [];
  for (let i = 0; i < path.length - 1; i += 1) {
    const currPoint = path[i].point;
    const nextPoint = path[i + 1].point;
    const edgeLength = currPoint.distance(nextPoint);
    const increments = Math.floor(edgeLength / granularity);
    const xIncr = (nextPoint.x - currPoint.x) / increments;
    const yIncr = (nextPoint.y - currPoint.y) / increments;
    res.push(currPoint);
    for (let j = 0; j < increments - 1; j += 1) {
      const prev = _.last(res);
      res.push({ x: prev.x + xIncr, y: prev.y + yIncr });
    }
  }
  res.push(_.last(path));
  return res;
}


export function chaseEnemyFC(me, enemyFC) {
  // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
  const enemyShortestPath = [];
  _.forEach(
    funnelPolypoints(getShortestPolypointPath(
      { xp: enemyFC.x + BRP, yp: enemyFC.y + BRP },
      getEnemyGoal(),
      getDTGraph(),
    ), getDTGraph()),
    polypoint => enemyShortestPath.push(polypoint),
  );

  // Set goal as the interception point
  const interceptionPolypoint = _.find(getPointsAlongPath(enemyShortestPath), polypoint => {
    const pp = new Point(polypoint.x, polypoint.y);
    const myDist = pp.distance(new Point(me.x + BRP, me.y + BRP));
    const enemyDist = pp.distance(new Point(enemyFC.x + BRP, enemyFC.y + BRP));
    return myDist < enemyDist;
  });
  const goal = interceptionPolypoint ?
    { xp: interceptionPolypoint.x, yp: interceptionPolypoint.y } :
    { xp: enemyFC.x + enemyFC.vx, yp: enemyFC.y + enemyFC.vy };
  return { goal, enemyShortestPath };
}

/**
 * @param { Object } me
 * @returns {{goal: {xp: number, yp: number}, enemyShortestPath: PolyPoint[]}} goal, our global
 *   destination in pixels and enemyShortestPath, the polypoints that we predict our enemy to
 *   follow
 */
function centerFlagFSM(me) {
  // If the bot has the flag, go to the endzone
  if (me.flag) {
    const goal = amRed() ? findCachedTile('RED_ENDZONE') : findCachedTile('BLUE_ENDZONE');
    const enemyShortestPath = [];
    console.info('I have the flag. Seeking endzone!');
    return { goal, enemyShortestPath };
  }
  // If an enemy player in view has the flag, chase
  const enemyFC = findEnemyFC();
  if (enemyFC) {
    const { goal, enemyShortestPath } = chaseEnemyFC(me, enemyFC);
    console.info('I see an enemy with the flag. Chasing!');
    return { goal, enemyShortestPath };
  }
  // If the enemy team has the flag, go to central flag station
  if (enemyTeamHasFlag()) {
    const goal = findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
    const enemyShortestPath = [];
    console.info('Enemy has the flag. Headed towards the central flag station');
    return { goal, enemyShortestPath };
  }
  // If my team has the flag, go to our endzone
  if (myTeamHasFlag()) {
    const goal = amRed() ? findCachedTile('RED_ENDZONE') : findCachedTile('BLUE_ENDZONE');
    const enemyShortestPath = [];
    console.info('We have the flag. Headed towards our Endzone.');
    return { goal, enemyShortestPath };
  }
  // Go to the central flag station in hopes of grabbing the flag
  const goal = findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
  const enemyShortestPath = [];
  console.info('Nobody has the flag. Going to central flag station!');
  return { goal, enemyShortestPath };
}


/**
 * @param { Object } me
 * @returns {{goal: {xp: number, yp: number}, enemyShortestPath: PolyPoint[]}} goal, our global
 *   destination in pixels and enemyShortestPath, the polypoints that we predict our enemy to
 *   follow
 */
function twoFlagFSM(me) {
  // If I have the flag, then go to the endzone in hopes of capping
  if (me.flag) {
    const goal = amRed() ? findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
      findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
    const enemyShortestPath = [];
    console.info('I have the flag. Seeking endzone!');
    return { goal, enemyShortestPath };
  }
  // If an enemy player in view has the flag, chase them in hopes of tagging
  const enemyFC = findEnemyFC();
  if (enemyFC) {
    const { goal, enemyShortestPath } = chaseEnemyFC(me, enemyFC);
    console.info('I see an enemy with the flag. Chasing!');
    return { goal, enemyShortestPath };
  }
  // Go to the enemy flag station in hopes of spotting the enemy FC
  const goal = amBlue() ? findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
    findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
  const enemyShortestPath = [];
  console.info("I don't know what to do. Going to enemy base!");
  return { goal, enemyShortestPath };
}


/**
 * @param { Object } me
 * @returns {{goal: {xp: number, yp: number}, enemyShortestPath: PolyPoint[]}} goal, our global
 *   destination in pixels and enemyShortestPath, the polypoints that we predict our enemy to
 *   follow
 */
export function FSM(me) {
  return isCenterFlag() ? centerFlagFSM(me) : twoFlagFSM(me);
}
