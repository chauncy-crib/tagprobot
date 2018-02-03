import _ from 'lodash';

import { tileHasName, tileIsOneOf } from '../look/tileInfo';
import { isOnMyTeam } from './gameState';
import { PPTL } from '../constants';
import { assert } from '../utils/asserts';


const locations = {};


/**
 * @param {string} tileName
 * @returns {{xt: number, yt: number}} a tile which is at the center of mass of all occurrences of
 *   tileName in the tagpro map
 */
function centerOfMass(tileName) {
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
 * Parses each tile of the TagPro map. If it discovers a flag, add its location to the locations
 *   object. Also defines the endzone positions for red and blue teams.
 */
export function setupLocations() {
  assert(tagpro.map, 'tagpro.map is undefined');
  locations.BLUE_ENDZONE = centerOfMass('BLUE_ENDZONE');
  locations.RED_ENDZONE = centerOfMass('RED_ENDZONE');
  for (let xt = 0, xl = tagpro.map.length; xt < xl; xt++) {
    for (let yt = 0, yl = tagpro.map[0].length; yt < yl; yt++) {
      if (tileIsOneOf(tagpro.map[xt][yt], ['RED_FLAG', 'RED_FLAG_TAKEN'])) {
        locations.RED_FLAG = { xt, yt };
        locations.RED_FLAG_TAKEN = { xt, yt };
      } else if (tileIsOneOf(tagpro.map[xt][yt], ['BLUE_FLAG', 'BLUE_FLAG_TAKEN'])) {
        locations.BLUE_FLAG = { xt, yt };
        locations.BLUE_FLAG_TAKEN = { xt, yt };
      } else if (tileIsOneOf(tagpro.map[xt][yt], ['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN'])) {
        locations.YELLOW_FLAG = { xt, yt };
        locations.YELLOW_FLAG_TAKEN = { xt, yt };
      }
    }
  }
}


/**
 * Returns the position xp and yp (in pixels) of the center of one of the specified tile
 *   types. Assumes that the potential location of the tile has been stored by calling
 *   setupLocations(). Runtime: O(1)
 * @param {(number | number[])} tiles - either a number representing a tileType,
 *   or an array of such numbers
 */
export function findCachedTile(tileNames) {
  const tileNameArray = [].concat(tileNames);
  for (let i = 0; i < tileNameArray.length; i++) {
    const name = tileNameArray[i];
    if (_.has(locations, name)) {
      const { xt, yt } = locations[name];
      if (tileHasName(tagpro.map[xt][yt], name)) {
        return { xp: (xt * PPTL) + (PPTL / 2), yp: (yt * PPTL) + (PPTL / 2) };
      }
    }
  }
  return null;
}


/**
 * Returns the enemy FC object from the tagpro.players array, if in view
 * @returns {Object} the enemy FC object
 */
export function findEnemyFC() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw
  ));
}
