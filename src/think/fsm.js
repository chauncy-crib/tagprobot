import _ from 'lodash';

import { BRP } from '../global/constants';
import { drawEnemyPath } from '../draw/triangulation';
import { amRed,
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


export function chaseEnemyFC(me, goal, enemyFC, enemyShortestPath) {
  // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
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
  if (interceptionPolypoint) {
    // Subtract PPTL/2 because in getAccelValues in bot.js we add them back
    goal.xp = interceptionPolypoint.x;
    goal.yp = interceptionPolypoint.y;
  } else {
    goal.xp = enemyFC.x + enemyFC.vx;
    goal.yp = enemyFC.y + enemyFC.vy;
  }
}


/**
 * The logic/flowchart to get where our goal is.
 *   Center Flag:
 *     If I have the flag, go to my endzone.
 *     If an enemy in view has the flag, chase.
 *     If the enemy team has the flag but I can't see them, go to their endzone.
 *     If we have the flag, go to our endzone.
 *     Else, go to the flag station.
 *   Two Flag:
 *     If I have the flag, go to my base
 *     If an enemy in view has the flage, chase.
 *     Else, go to the enemy base.
 * @param { Object } me
 * @returns {{xp: number, yp: number}} the position, in pixels, of the bot's goal, which is
 *   determined by the current state of the game
 */
export function FSM(me) {
  let goal = {};
  const enemyShortestPath = [];

  if (isCenterFlag()) { // in center flag game
    if (me.flag) { // if the bot has the flag, go to the endzone
      goal = amRed() ? findCachedTile('RED_ENDZONE') : findCachedTile('BLUE_ENDZONE');
      console.info('I have the flag. Seeking endzone!');
    } else {
      const enemyFC = findEnemyFC();
      if (enemyFC) { // if an enemy player in view has the flag, chase
        chaseEnemyFC(me, goal, enemyFC, enemyShortestPath);
        console.info('I see an enemy with the flag. Chasing!');
      } else if (enemyTeamHasFlag()) {
        goal = findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
        console.info('Enemy has the flag. Headed towards the central flag station');
      } else if (myTeamHasFlag()) {
        goal = amRed() ? findCachedTile('RED_ENDZONE') : findCachedTile('BLUE_ENDZONE');
        console.info('We have the flag. Headed towards our Endzone.');
      } else {
        goal = findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
        console.info('Nobody has the flag. Going to central flag station!');
      }
    }
  } else { // in two flag game
    if (me.flag) {
      goal = amRed() ? findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
        findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
      console.info('I have the flag. Seeking endzone!');
    } else {
      const enemyFC = findEnemyFC();
      if (enemyFC) { // if an enemy player in view has the flag, chase
        chaseEnemyFC(me, goal, enemyFC, enemyShortestPath);
        console.info('I see an enemy with the flag. Chasing!');
      } else {
        goal = amBlue() ? findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
          findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
        console.info("I don't know what to do. Going to enemy base!");
      }
    }
  }
  drawEnemyPath(enemyShortestPath);
  return goal;
}
