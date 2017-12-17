import _ from 'lodash';

import { tileHasName, tileIsOneOf } from '../tiles';
import { isOnMyTeam } from './player';
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

  for (let xt = 0, xl = tagpro.map.length; xt < xl; xt++) {
    for (let yt = 0, yl = tagpro.map[0].length; yt < yl; yt++) {
      for (let i = 0; i < tileNameArray.length; i++) {
        if (tileHasName(tagpro.map[xt][yt], tileNameArray[i])) {
          return { xp: xt * PPTL, yp: yt * PPTL };
        }
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
