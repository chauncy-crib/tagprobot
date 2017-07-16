import { PIXELS_PER_TILE, tileTypes } from './constants';
import { getTraversableCells, findApproxTile } from './helpers/map';
import { findMyEndzone, findFlagStation } from './helpers/gameState';
import { getMe, getEnemy, getEnemyFC } from './helpers/player';
import getTarget from './helpers/path';
import { move } from './utils';

/*
 * The logic/flowchart.
 *   If team flag is home, sit on flag.
 *   If team flag is gone, go to enemy team flag.
 *   If an enemy FC is spotted at any time, chase.
 *
 * Note: There is NO pathfinding.
 */
function getGoal() {
  let goal;
  const me = getMe();
  // If the bot has the flag, go to the endzone
  if (me.flag) {
    // Really bad jukes !!!!! DISABLED FOR NOW
    if (false) { // eslint-disable-line no-constant-condition
      const chaser = getEnemy();
      goal = chaser;
      goal.x = (2 * (me.x + me.vx)) - (chaser.x + chaser.vx);
      goal.y = (2 * (me.y + me.vy)) - (chaser.y + chaser.vy);
      console.log('I have the flag. Fleeing enemy!');
      // Really bad caps
    } else {
      goal = findMyEndzone();
      console.log('I have the flag. Seeking endzone!');
    }
  } else {
    const enemyFC = getEnemyFC();
    if (enemyFC) { // If an enemy player in view has the flag, chase
      goal = enemyFC;
      goal.x = enemyFC.x + enemyFC.vx;
      goal.y = enemyFC.y + enemyFC.vy;
      console.log('I see an enemy with the flag. Chasing!');
    } else if (tagpro.ui.yellowFlagTakenByBlue) {
      goal = findApproxTile(tileTypes.BLUE_ENDZONE);
      console.log('Blue has the flag. Headed towards the Blue Endzone.');
    } else if (tagpro.ui.yellowFlagTakenByRed) {
      goal = findApproxTile(tileTypes.RED_ENDZONE);
      console.log('Red has the flag. Headed towards the Red Endzone.');
    } else {
      goal = findFlagStation();
      console.log("I don't know what to do. Going to central flag station!");
    }
  }
  return goal;
}


/*
 * Gets the x and y displacement that we should move next
 */
function getSeek() {
  const goal = getGoal();
  const me = getMe();

  // Version for attempting path-planning
  const gridPosition = {
    x: Math.floor((me.x + 20) / PIXELS_PER_TILE),
    y: Math.floor((me.y + 20) / PIXELS_PER_TILE),
  };
  const gridTarget = {
    x: Math.floor(goal.x / PIXELS_PER_TILE),
    y: Math.floor(goal.y / PIXELS_PER_TILE),
  };
  const nearGoal = getTarget(
    gridPosition.x,
    gridPosition.y,
    gridTarget.x,
    gridTarget.y,
    getTraversableCells(1, tagpro.map),
  );
  nearGoal.x *= PIXELS_PER_TILE;
  nearGoal.y *= PIXELS_PER_TILE;

  // Version for not attempting path-planning
  // seek.x = goal.x - (self.x + self.vx);
  // seek.y = goal.y - (self.y + self.vy);
  return {
    x: nearGoal.x - (me.x + me.vx),
    y: nearGoal.y - (me.y + me.vy),
  };
}

export default function botLoop() {
  move(getSeek());
}
