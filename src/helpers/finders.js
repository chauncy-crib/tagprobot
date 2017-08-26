import _ from 'lodash';

import { getMyEndzoneTile, getEnemyEndzoneTile, isOnMyTeam } from './player';
import { getTileId } from '../tiles';
import { PPTL } from '../constants';
import { assert } from '../utils/asserts';


/*
 * Returns the position x and y (in pixels) of the first of the specified tile
 * types to appear starting in the top left corner and moving in a page-reading
 * fashion.
 *
 * Runtime: O(N^2)
 *
 * @param {(number | number[])} tiles - either a number representing a tileType,
 * or an array of such numbers
 */
export function findTile(map, tileIds) {
  assert(map, 'map is undefined');
  assert(tileIds, 'tileIds is undefined');

  // Force an array if the input is just one tile
  const tileIdArray = [].concat(tileIds);

  for (let x = 0, xl = map.length, yl = map[0].length; x < xl; x++) {
    for (let y = 0; y < yl; y++) {
      for (let i = 0; i < tileIdArray.length; i++) {
        const tileId = tileIdArray[i];
        if (map[x][y] === tileId) {
          return { x: x * PPTL, y: y * PPTL };
        }
      }
    }
  }
  throw new Error(`Unable to find tile: ${tileIds}`);
}


/*
 * Returns the position of the endzone you should return a the flag to.
 *
 * @return {Object} object with the endzone's position in pixels, x and y, and
 * in cells, xc and yc
 */
export function findMyEndzone(map) {
  // TODO: return closest endzone tile instead of first
  return findTile(map, getMyEndzoneTile());
}


/*
 * Returns the position (in pixels) of the endzone you should defend
 *
 * @return {Object} object with the endzone's position in pixels, x and y, and
 * in cells, xc and yc
 */
export function findEnemyEndzone(map) {
  // TODO: return closest endzone tile instead of first
  return findTile(map, getEnemyEndzoneTile());
}


/*
 * Returns the position (in pixels) of the specified flag station, even if empty
 *
 * @return {Object} object with the flag station's position in pixels, x and
 * y, and in cells, xc and yc
 */
export function findFlagStation(map) {
  return findTile(map, [getTileId('YELLOW_FLAG'), getTileId('YELLOW_FLAG_TAKEN')]);
}


/*
 * Returns the enemy FC object from the tagpro.players array, if in view
 *
 * @return {Object} the enemy FC object
 */
export function findEnemyFC() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw
  ));
}
