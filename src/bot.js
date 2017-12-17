import { PPCL, BRP, LOOKAHEAD, RED_ENDZONE, BLUE_ENDZONE } from './constants';
import { isCenterFlag } from './helpers/constants';
import { getMapTraversabilityInCells } from './helpers/map';
import { findTile, findEnemyFC } from './helpers/finders';
import { myTeamHasFlag, enemyTeamHasFlag } from './helpers/gameState';
import { getMe, amBlue, amRed } from './helpers/player';
import { getShortestCellPath } from './helpers/path';
import { chaseEnemyFC } from './helpers/fsm';
import { isAutonomousMode, isVisualMode, move, dequeueChatMessages } from './utils/interface';
import { drawAllyCellPath, drawEnemyCellPath, drawPolypointPath } from './draw/drawings';
import { desiredAccelerationMultiplier } from './helpers/physics';
import { getShortestPolypointPath } from './navmesh/path';
import { getDTGraph } from './navmesh/triangulation';


/**
 * The logic/flowchart to get where our goal is.
 * Center Flag:
 *   If I have the flag, go to my endzone.
 *   If an enemy in view has the flag, chase him.
 *   If the enemy team has the flag but I can't see them, go to their endzone.
 *   If we have the flag, go to our endzone.
 *   Else, go to the flag station.
 * Two Flag:
 *   If I have the flag, go to my base
 * @returns {{xp: number, yp: number}} the position, in pixels, of the bot's goal, which is
 *   determined by the current state of the game
 */
function getGoalPos() {
  const me = getMe();
  let goal = {};
  const enemyShortestPath = [];

  if (isCenterFlag()) { // in center flag game
    if (me.flag) { // if the bot has the flag, go to the endzone
      goal = amRed() ? RED_ENDZONE : BLUE_ENDZONE;
      console.info('I have the flag. Seeking endzone!');
    } else {
      const enemyFC = findEnemyFC();
      if (enemyFC) { // if an enemy player in view has the flag, chase
        chaseEnemyFC(me, goal, enemyFC, enemyShortestPath);
        console.info('I see an enemy with the flag. Chasing!');
      } else if (enemyTeamHasFlag()) {
        goal = amBlue() ? RED_ENDZONE : BLUE_ENDZONE;
        console.info('Enemy has the flag. Headed towards the Enemy Endzone.');
      } else if (myTeamHasFlag()) {
        goal = amRed() ? RED_ENDZONE : BLUE_ENDZONE;
        console.info('We have the flag. Headed towards our Endzone.');
      } else {
        goal = findTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
        console.info("I don't know what to do. Going to central flag station!");
      }
    }
  } else { // in two flag game
    if (me.flag) {
      goal = amRed() ? findTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
        findTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
      console.info('I have the flag. Seeking endzone!');
    } else {
      const enemyFC = findEnemyFC();
      if (enemyFC) { // if an enemy player in view has the flag, chase
        chaseEnemyFC(me, goal, enemyFC, enemyShortestPath);
        console.info('I see an enemy with the flag. Chasing!');
      } else if (enemyTeamHasFlag()) {
        goal = amBlue() ? findTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
          findTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
        console.info('Enemy has the flag. Headed towards the enemy base.');
      } else {
        goal = amBlue() ? findTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
          findTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
        console.info("I don't know what to do. Going to enemy base!");
      }
    }
  }
  drawEnemyCellPath(enemyShortestPath);
  return goal;
}


/**
 * @returns {{accX: number, accY: number}} The desired acceleration multipliers the bot should
 *   achieve with arrow key presses. Positive directions are down and right.
 */
function getAccelValues() {
  const { map } = tagpro;
  const me = getMe();

  const goal = getGoalPos();
  me.xc = Math.floor((me.x + (PPCL / 2)) / PPCL);
  me.yc = Math.floor((me.y + (PPCL / 2)) / PPCL);

  const finalTarget = {
    xp: goal.xp,
    yp: goal.yp,
    xc: Math.floor(goal.xp / PPCL),
    yc: Math.floor(goal.yp / PPCL),
  };
  // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
  const traversableCells = getMapTraversabilityInCells(map);

  // TODO: runtime of this? Call is O(R) for now
  const shortestPath = getShortestCellPath(
    { xc: me.xc, yc: me.yc },
    { xc: finalTarget.xc, yc: finalTarget.yc },
    traversableCells,
  );
  const polypointShortestPath = getShortestPolypointPath(
    { xp: me.x + BRP, yp: me.y + BRP },
    finalTarget,
    getDTGraph(),
  );

  // Runtime: O(A), O(1) if visualizations off
  drawAllyCellPath(shortestPath);
  drawPolypointPath(polypointShortestPath);

  const target = { xp: me.x + BRP, yp: me.y + BRP };
  if (shortestPath) {
    const targetCell = shortestPath[Math.min(LOOKAHEAD + 1, shortestPath.length - 1)];
    target.xp = Math.floor((targetCell.xc + 0.5) * PPCL);
    target.yp = Math.floor((targetCell.yc + 0.5) * PPCL);
  } else {
    console.warn('Shortest path was null, using own location as target');
  }

  return desiredAccelerationMultiplier(
    me.x + BRP, // the x center of our ball, in pixels
    me.y + BRP, // the y center of our ball, in pixels
    me.vx, // our v velocity
    me.vy, // our y velocity
    target.xp, // the x we are seeking toward (pixels)
    target.yp, // the y we are seeking toward (pixels)
  );
}


/**
 * The base loop for defining the bot's behavior.
 */
export default function botLoop() {
  dequeueChatMessages();
  if (isAutonomousMode()) {
    move(getAccelValues());
  } else if (isVisualMode()) {
    getAccelValues();
  }
}
