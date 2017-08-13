import _ from 'lodash';

import { getMyEndzoneTile, getEnemyEndzoneTile, isOnMyTeam } from './player';
import { findTile } from './map';
import { getTileId } from '../tiles';


/*
 * Returns the position of the endzone you should return a the flag to.
 *
 * @return {object} - object with the endzone's position in pixels, x and y, and
 * in cells, xc and yc
 */
export function findMyEndzone() {
  // TODO: return closest endzone tile instead of first
  return findTile(getMyEndzoneTile());
}


/*
 * Returns the position (in pixels) of the endzone you should defend
 *
 * @return {object} - object with the endzone's position in pixels, x and y, and
 * in cells, xc and yc
 */
export function findEnemyEndzone() {
  // TODO: return closest endzone tile instead of first
  return findTile(getEnemyEndzoneTile());
}


/*
 * Returns the position (in pixels) of the specified flag station, even if empty
 *
 * @return {object} - object with the flag station's position in pixels, x and
 * y, and in cells, xc and yc
 */
export function findFlagStation() {
  return findTile([getTileId('YELLOW_FLAG'), getTileId('YELLOW_FLAG_TAKEN')]);
}


/*
 * Returns the enemy FC object from the tagpro.players array, if in view
 *
 * @return {object} - the enemy FC object
 */
export function findEnemyFC() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw
  ));
}
