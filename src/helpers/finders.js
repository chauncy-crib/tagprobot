import _ from 'lodash';

import { getMyEndzoneTile, getEnemyEndzoneTile, isOnMyTeam } from './player';
import { findTile } from './map';
import { getTileId } from '../tiles';


/*
 * Returns the position (in pixels) of the endzone you should return a the flag to.
 * TODO: return closest endzone tile instead of first
 */
export function findMyEndzone() {
  return findTile(getMyEndzoneTile());
}

/*
* Returns the position (in pixels) of the endzone you should defend
* TODO: return closest endzone tile instead of first
*/
export function findEnemyEndzone() {
  return findTile(getEnemyEndzoneTile());
}

// Returns the position (in pixels) of the specified flag station, even if empty.
export function findFlagStation() {
  return findTile([getTileId('YELLOW_FLAG'), getTileId('YELLOW_FLAG_TAKEN')]);
}

// Returns the enemy FC from the tagpro.players array, if in view.
export function findEnemyFC() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw
  ));
}

// Returns the enemy FC from the tagpro.players array, if in view.
export function findEnemy() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    !player.dead &&
    player.draw
  ));
}
