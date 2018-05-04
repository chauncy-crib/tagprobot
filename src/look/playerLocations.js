import _ from 'lodash';

import { playerIsOnMyTeam } from './gameState';
import { Point } from '../interpret/class/Point';


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


export function playerIsNearPoint(player, point, distance = 300) {
  if (!(_.has(player, 'x') && _.has(player, 'y'))) return false;
  return point.distance(new Point(player.x, player.y)) <= distance;
}
