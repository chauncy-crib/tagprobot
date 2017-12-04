import { PPCL, BRP, LOOKAHEAD } from './constants';
import { getMapTraversabilityInCells } from './helpers/map';
import { findTile, findEnemyFC } from './helpers/finders';
import { myTeamHasFlag, enemyTeamHasFlag } from './helpers/gameState';
import { getMe, amBlue, amRed } from './helpers/player';
import { getShortestTilePath } from './helpers/path';
import { isAutonomousMode, isVisualMode, move, dequeueChatMessages } from './utils/interface';
import { drawAllyCellPath, drawEnemyCellPath, drawPolypointPath } from './draw/drawings';
import { desiredAccelerationMultiplier } from './helpers/physics';
import { getShortestPolypointPath } from './navmesh/path';
import { getDTGraph } from './navmesh/triangulation';


/**
 * The logic/flowchart to get where our goal is.
 *   If I have the flag, go to my endzone.
 *   If an enemy in view has the flag, chase him.
 *   If the enemy team has the flag but I can't see them, go to their endzone.
 *   If we have the flag, go to our endzone.
 *   Else, go to the flag station.
 * @returns {{xp: number, yp: number}} the position, in pixels, of the bot's goal, which is
 *   determined by the current state of the game
 */
function getGoalPos() {
  const me = getMe();
  let goal;
  const redEndzone = { xp: 1360, yp: 1560 };
  const blueEndzone = { xp: 640, yp: 440 };

  // If the bot has the flag, go to the endzone
  if (me.flag) {
    goal = amRed() ? redEndzone : blueEndzone;

    console.log('I have the flag. Seeking endzone!');
  } else {
    const enemyFC = findEnemyFC();
    let enemyShortestPath = [];
    if (enemyFC) { // If an enemy player in view has the flag, chase
      const enemyGoal = amBlue() ? redEndzone : blueEndzone;
      const enemyFinalTarget = {
        xc: Math.floor(enemyGoal.xp / PPCL),
        yc: Math.floor(enemyGoal.yp / PPCL),
      };
      enemyFC.xc = Math.floor((enemyFC.x + (PPCL / 2)) / PPCL);
      enemyFC.yc = Math.floor((enemyFC.y + (PPCL / 2)) / PPCL);
      const { map } = tagpro;
      // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
      const traversableCells = getMapTraversabilityInCells(map);
      enemyShortestPath = getShortestTilePath(
        { xc: enemyFC.xc, yc: enemyFC.yc },
        { xc: enemyFinalTarget.xc, yc: enemyFinalTarget.yc },
        traversableCells,
      );
      // Runtime: O(B), O(1) if visualizations off
      goal = enemyFC;
      goal.xp = enemyFC.x + enemyFC.vx;
      goal.yp = enemyFC.y + enemyFC.vy;
      console.log('I see an enemy with the flag. Chasing!');
    } else if (enemyTeamHasFlag()) {
      goal = amBlue() ? redEndzone : blueEndzone;
      console.log('Enemy has the flag. Headed towards the Enemy Endzone.');
    } else if (myTeamHasFlag()) {
      goal = amRed() ? redEndzone : blueEndzone;
      console.log('We have the flag. Headed towards our Endzone.');
    } else {
      goal = findTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
      console.log("I don't know what to do. Going to central flag station!");
    }
    drawEnemyCellPath(enemyShortestPath);
  }
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
  const shortestPath = getShortestTilePath(
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
    console.log('Shortest path was null, using own location as target');
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
