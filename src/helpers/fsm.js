import _ from 'lodash';
import { getDist } from '../utils/geometry';
import { drawEnemyPolypointPath } from '../draw/drawings';
import { isCenterFlag } from './constants';
import { amRed, amBlue, getEnemyGoal } from './player';
import { findCachedTile, findEnemyFC } from './finders';
import { BRP } from '../constants';
import { getShortestPolypointPath } from '../navmesh/path';
import { myTeamHasFlag, enemyTeamHasFlag } from './gameState';
import { getDTGraph } from '../navmesh/triangulation';


export function chaseEnemyFC(me, goal, enemyFC, enemyShortestPath) {
  // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
  _.forEach(getShortestPolypointPath(
    { xp: enemyFC.x + BRP, yp: enemyFC.y + BRP },
    getEnemyGoal(),
    getDTGraph(),
  ), polypoint => enemyShortestPath.push(polypoint));

  // Set goal as the interception point
  const interceptionPolypoint = _.find(enemyShortestPath, polypoint =>
    getDist(polypoint.point.x, polypoint.point.y, me.x, me.y) <
      getDist(polypoint.point.x, polypoint.point.y, enemyFC.x, enemyFC.y));
  if (interceptionPolypoint) {
    goal.xp = interceptionPolypoint.point.x;
    goal.yp = interceptionPolypoint.point.y;
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
        goal = amBlue() ? findCachedTile('RED_ENDZONE') : findCachedTile('BLUE_ENDZONE');
        console.info('Enemy has the flag. Headed towards the Enemy Endzone.');
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
  drawEnemyPolypointPath(enemyShortestPath);
  return goal;
}
