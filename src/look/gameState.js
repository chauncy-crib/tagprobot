import { assert } from '../global/utils';
import { TEAMS } from './constants';
import { findCachedTile } from './locations';
import { getTileProperty, tileIsOneOf, tileHasName } from '../look/tileInfo';


let me;
let currGameIsCenterFlag;


export function initMe() {
  me = tagpro.players[tagpro.playerId];
}


export function getMe() {
  return me;
}


export function amBlue() {
  return me.team === TEAMS.BLUE;
}


export function amRed() {
  return me.team === TEAMS.RED;
}


export function isOnMyTeam(player) {
  return player.team === me.team;
}


export function initIsCenterFlag() {
  currGameIsCenterFlag = findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']) !== null;
}


export function isCenterFlag() {
  return currGameIsCenterFlag;
}


export function myTeamHasFlag() {
  return amBlue()
    ? tagpro.ui.yellowFlagTakenByBlue
    : tagpro.ui.yellowFlagTakenByRed;
}


export function enemyTeamHasFlag() {
  return amBlue()
    ? tagpro.ui.yellowFlagTakenByRed
    : tagpro.ui.yellowFlagTakenByBlue;
}


export function getAllyEndzoneTileName() {
  return amBlue() ? 'BLUE_ENDZONE' : 'RED_ENDZONE';
}


export function getEnemyEndzoneTileName() {
  return amBlue() ? 'RED_ENDZONE' : 'BLUE_ENDZONE';
}


// Returns whether or not ally team's flag is taken
export function isAllyFlagTaken() {
  return amBlue() ? tagpro.ui.blueFlagTaken : tagpro.ui.redFlagTaken;
}


export function getEnemyGoal() {
  if (isCenterFlag()) {
    return amBlue() ?
      findCachedTile('RED_ENDZONE') :
      findCachedTile('BLUE_ENDZONE');
  }
  return amBlue() ? findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
    findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on the left.
 */
export function wallOnLeft(map, x, y) {
  if (x === 0) return true;
  const id = map[x - 1][y];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_2'])) return false;
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on the right.
 */
export function wallOnRight(map, xt, yt) {
  if (xt === map.length - 1) return true;
  const id = map[xt + 1][yt];
  if (tileIsOneOf(id, ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) return false;
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on top.
 */
export function wallOnTop(map, xt, yt) {
  if (yt === 0) return true;
  const id = map[xt][yt - 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) return false;
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) below it.
 */
export function wallOnBottom(map, xt, yt) {
  if (yt === map[0].length - 1) return true;
  const id = map[xt][yt + 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) return false;
  return !getTileProperty(id, 'traversable');
}


/**
 * Given a cell location, return if the cell above/below/left/right of it is perm-NT
 */
function permNTInDirection(map, x, y, direction) {
  switch (direction) {
    case 'UP': return (
      y === 0 || (
        !getTileProperty(map[x][y - 1], 'traversable') &&
        getTileProperty(map[x][y - 1], 'permanent')
      )
    );
    case 'DOWN': return (
      y === map[0].length - 1 || (
        !getTileProperty(map[x][y + 1], 'traversable') &&
        getTileProperty(map[x][y + 1], 'permanent')
      )
    );
    case 'LEFT': return (
      x === 0 || (
        !getTileProperty(map[x - 1][y], 'traversable') &&
        getTileProperty(map[x - 1][y], 'permanent')
      )
    );
    case 'RIGHT': return (
      x === map.length - 1 || (
        !getTileProperty(map[x + 1][y], 'traversable') &&
        getTileProperty(map[x + 1][y], 'permanent')
      )
    );
    default:
      assert(false, `${direction} not in UP, DOWN, LEFT, RIGHT`);
      return null;
  }
}


/**
 * Given an angle wall location, return true if it is traversable. (An NT angle wall has NT tiles
 * surrounding it).
 */
export function isAngleWallTraversable(map, x, y) {
  const id = map[x][y];
  if (tileHasName(id, 'ANGLE_WALL_1')) {
    return !permNTInDirection(map, x, y, 'UP') || !permNTInDirection(map, x, y, 'RIGHT');
  }
  if (tileHasName(id, 'ANGLE_WALL_2')) {
    return !permNTInDirection(map, x, y, 'DOWN') || !permNTInDirection(map, x, y, 'RIGHT');
  }
  if (tileHasName(id, 'ANGLE_WALL_3')) {
    return !permNTInDirection(map, x, y, 'DOWN') || !permNTInDirection(map, x, y, 'LEFT');
  }
  if (tileHasName(id, 'ANGLE_WALL_4')) {
    return !permNTInDirection(map, x, y, 'UP') || !permNTInDirection(map, x, y, 'LEFT');
  }
  assert(false, `Tile at ${x}, ${y} was not an angle wall`);
  return null;
}
