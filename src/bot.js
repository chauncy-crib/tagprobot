import { PPCL, BRP } from './constants';
import { getMapTraversabilityInCells } from './helpers/map';
import { findTile, findEnemyFC } from './helpers/finders';
import { myTeamHasFlag, enemyTeamHasFlag } from './helpers/gameState';
// TODO: swap
import { getMe, amBlue, amRed } from './helpers/player';
// import { getMe, getAllyEndzoneTileName, getEnemyEndzoneTileName } from './helpers/player';
import { getShortestPath, getTarget } from './helpers/path';
import { isAutonomousMode, isVisualMode, move, dequeueChatMessages } from './utils/interface';
import { updatePath } from './draw/drawings';


/*
 * The logic/flowchart to get where our goal is.
 *   If I have the flag, go to my endzone.
 *   If an enemy in view has the flag, chase him.
 *   If the enemy team has the flag but I can't see them, go to their endzone.
 *   If we have the flag, go to our endzone.
 *   Else, go to the flag station.
 *
 * @return {Object} - the position, in pixels, of the bot's goal, which is
 * determined by the current state of the game
 */
function getGoalPos() {
  const me = getMe();
  let goal;

  // If the bot has the flag, go to the endzone
  if (me.flag) {
    // TODO: remove hardcode
    goal = amRed() ? { x: 1320, y: 1360 } : { x: 440, y: 400 };
    // goal = findTile(getAllyEndzoneTileName());

    console.log('I have the flag. Seeking endzone!');
  } else {
    const enemyFC = findEnemyFC();
    if (enemyFC) { // If an enemy player in view has the flag, chase
      goal = enemyFC;
      goal.x = enemyFC.x + enemyFC.vx;
      goal.y = enemyFC.y + enemyFC.vy;
      console.log('I see an enemy with the flag. Chasing!');
    } else if (enemyTeamHasFlag()) {
      // TODO: remove hardcode
      goal = amBlue() ? { x: 1360, y: 1360 } : { x: 400, y: 400 };
      // goal = findTile(getEnemyEndzoneTileName());
      console.log('Enemy has the flag. Headed towards the Enemy Endzone.');
    } else if (myTeamHasFlag()) {
      // TODO: remove hardcode
      goal = amRed() ? { x: 1360, y: 1360 } : { x: 400, y: 400 };
      // goal = findTile(getAllyEndzoneTileName());
      console.log('We have the flag. Headed towards our Endzone.');
    } else {
      goal = findTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
      console.log("I don't know what to do. Going to central flag station!");
    }
  }

  return goal;
}


/*
 * @return {Object} - an object with position of the next immediate place to
 * navigate to in pixels, x and y
 */
function getNextTargetPos() {
  const { map } = tagpro;
  const me = getMe();

  const goal = getGoalPos();
  me.xc = Math.floor((me.x + (PPCL / 2)) / PPCL);
  me.yc = Math.floor((me.y + (PPCL / 2)) / PPCL);

  const finalTarget = {
    xc: Math.floor(goal.x / PPCL),
    yc: Math.floor(goal.y / PPCL),
  };
  // Runtime: O(E*CPTL^2) with visualizations on, O(E + S*CPTL^2) with visualizations off
  const traversableCells = getMapTraversabilityInCells(map);

  // TODO: runtime of this? Call is O(R) for now
  const shortestPath = getShortestPath(
    { xc: me.xc, yc: me.yc },
    { xc: finalTarget.xc, yc: finalTarget.yc },
    traversableCells,
  );
  // Runtime: O(A), O(1) if visualizations off
  updatePath(shortestPath);

  const nextTarget = getTarget(
    { xc: me.xc, yc: me.yc },
    shortestPath,
  );
  // Math to move the center of the TPB ball to the center of the target cell
  nextTarget.x = ((nextTarget.xc * PPCL) + (PPCL / 2)) - BRP;
  nextTarget.y = ((nextTarget.yc * PPCL) + (PPCL / 2)) - BRP;

  return {
    x: nextTarget.x - (me.x + me.vx),
    y: nextTarget.y - (me.y + me.vy),
  };
}


export default function botLoop() {
  dequeueChatMessages();
  if (isAutonomousMode()) {
    move(getNextTargetPos());
  } else if (isVisualMode()) {
    getNextTargetPos();
  }
}
