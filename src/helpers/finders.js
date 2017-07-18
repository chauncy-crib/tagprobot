import _ from 'lodash';

import { tileTypes } from '../constants';
import { getMyEndzoneTile, getEnemyEndzoneTile, isOnMyTeam } from './player';
import { findTile } from './map';

// Returns the position of the endzone you should return a the flag to.
// TODO: return closest endzone tile instead of first
export function findMyEndzone() {
  return findTile(getMyEndzoneTile());
}

// Returns the position of the endzone you should defend
// TODO: return closest endzone tile instead of first
export function findEnemyEndzone() {
  return findTile(getEnemyEndzoneTile());
}

/*
 * Returns the position (in pixels) of the specified flag station, even if empty.
 */
export function findFlagStation() {
  return findTile([tileTypes.YELLOW_FLAG, tileTypes.YELLOW_FLAG_TAKEN]);
}

// Returns the enemy FC if in view.
export function findEnemyFC() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw
  ));
}

// Returns an enemy if in view
export function findEnemy() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    !player.dead &&
    player.draw
  ));
}
