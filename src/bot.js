import { PPCL } from './constants';
import { getMapTraversabilityInCells } from './helpers/map';
import {
  findMyEndzone,
  findEnemyEndzone,
  findFlagStation,
  findEnemyFC,
} from './helpers/finders';
import { myTeamHasFlag, enemyTeamHasFlag } from './helpers/gameState';
import { getMe } from './helpers/player';
import { getShortestPath, getTarget } from './helpers/path';
import { move } from './utils/interface';
import { updatePath } from './draw/drawings';


/*
 * The logic/flowchart to get where our goal is.
 *   If I have the flag, go to my endzone.
 *   If an enemy in view has the flag, chase him.
 *   If the enemy team has the flag but I can't see them, go to their endzone.
 *   If we have the flag, go to our endzone.
 *   Else, go to the flag station.
 *
 * @return {object} - the position, in pixels, of the bot's goal, which is
 * determined by the current state of the game
 */
function getGoalPos() {
  let goal;
  const me = getMe();
  // If the bot has the flag, go to the endzone
  if (me.flag) {
    goal = findMyEndzone();
    console.log('I have the flag. Seeking endzone!');
  } else {
    const enemyFC = findEnemyFC();
    if (enemyFC) { // If an enemy player in view has the flag, chase
      goal = enemyFC;
      goal.x = enemyFC.x + enemyFC.vx;
      goal.y = enemyFC.y + enemyFC.vy;
      console.log('I see an enemy with the flag. Chasing!');
    } else if (enemyTeamHasFlag()) {
      goal = findEnemyEndzone();
      console.log('Enemy has the flag. Headed towards the Enemy Endzone.');
    } else if (myTeamHasFlag()) {
      goal = findMyEndzone();
      console.log('We have the flag. Headed towards our Endzone.');
    } else {
      goal = findFlagStation();
      console.log("I don't know what to do. Going to central flag station!");
    }
  }
  return goal;
}


/*
 * @return {object} - the position, in pixels, of the next immediate place to
 * navigate to. Has an x and a y attribute.
 */
function getNextTargetPos() {
  const goal = getGoalPos();
  const me = getMe();

  const myPosInCells = {
    x: Math.floor((me.x + (PPCL / 2)) / PPCL),
    y: Math.floor((me.y + (PPCL / 2)) / PPCL),
  };
  const finalTargetPosInCells = {
    x: Math.floor(goal.x / PPCL),
    y: Math.floor(goal.y / PPCL),
  };

  const traversableCells = getMapTraversabilityInCells(tagpro.map);
  const shortestPath = getShortestPath(
    myPosInCells.x,
    myPosInCells.y,
    finalTargetPosInCells.x,
    finalTargetPosInCells.y,
    traversableCells,
  );
  updatePath(shortestPath);

  const nextTargetPosInCells = getTarget(
    myPosInCells.x,
    myPosInCells.y,
    shortestPath,
  );
  const nextTargetPosInPixels = {
    x: nextTargetPosInCells.x * PPCL,
    y: nextTargetPosInCells.y * PPCL,
  };

  return {
    x: nextTargetPosInPixels.x - (me.x + me.vx),
    y: nextTargetPosInPixels.y - (me.y + me.vy),
  };
}


export default function botLoop() {
  move(getNextTargetPos());
}
