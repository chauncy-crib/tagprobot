import _ from 'lodash';

import { assert } from '../global/utils';
import { PPTL } from '../global/constants';
import { tileLocations } from './setup';
import { tileHasName } from './tileInfo';
import { amBlue, playerIsOnMyTeam, isCenterFlag } from './gameState';


/**
 * @param {string} tileName
 * @returns {{xt: number, yt: number}} a tile which is at the center of mass of all occurrences of
 *   tileName in the tagpro map
 */
export function centerOfMass(tileName) {
  let xSum = 0;
  let ySum = 0;
  let count = 0;
  for (let xt = 0, xl = tagpro.map.length; xt < xl; xt++) {
    for (let yt = 0, yl = tagpro.map[0].length; yt < yl; yt++) {
      if (tileHasName(tagpro.map[xt][yt], tileName)) {
        xSum += xt;
        ySum += yt;
        count += 1;
      }
    }
  }
  if (count === 0) return null;
  return { xt: Math.floor(xSum / count), yt: Math.floor(ySum / count) };
}


/**
 * Returns the position xp and yp (in pixels) of the center of one of the specified tile
 *   types. Assumes that the potential location of the tile has been stored by calling
 *   initLocations(). Runtime: O(1)
 * @param {(number | number[])} tiles - either a number representing a tileType,
 *   or an array of such numbers
 */
export function findCachedTile(tileNames) {
  const tileNameArray = [].concat(tileNames);
  for (let i = 0; i < tileNameArray.length; i++) {
    const name = tileNameArray[i];
    if (_.has(tileLocations, name)) {
      const { xt, yt } = tileLocations[name];
      if (tileHasName(tagpro.map[xt][yt], name)) {
        return { xp: (xt * PPTL) + (PPTL / 2), yp: (yt * PPTL) + (PPTL / 2) };
      }
    }
  }
  return null;
}


/**
 * @returns {{xp: number, yp: number}} the location of the ally flag station
 */
export function findAllyFlagStation() {
  assert(!isCenterFlag(), 'tried to find ally flag station in a center flag game');
  return amBlue() ? findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']) :
    findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']);
}


/**
 * @returns {{xp: number, yp: number}} the location of the enemy flag station
 */
export function findEnemyFlagStation() {
  assert(!isCenterFlag(), 'tried to find enemy flag station in a center flag game');
  return amBlue() ? findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
    findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
}


/**
 * @returns {{xp: number, yp: number}} the location of the center flag station
 */
export function findCenterFlagStation() {
  assert(isCenterFlag(), 'tried to find center flag station in a two flag game');
  return findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
}


/**
 * Returns the enemy FC object from the tagpro.players array, if in view
 * @returns {Object} the enemy FC object
 */
export function findEnemyFC() {
  return _.find(tagpro.players, player => (
    !playerIsOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw
  ));
}
