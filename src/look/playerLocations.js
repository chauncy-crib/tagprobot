import _ from 'lodash';

import { playerIsOnMyTeam } from './gameState';
import { findAllyFlagStation } from './tileLocations';
import { Point } from '../interpret/class/Point';


/**
 * @returns {Object} the enemy flag carrier from tagpro.players, if in view
 */
export function findEnemyFC() {
  return _.find(tagpro.players, player => (
    !playerIsOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw
  ));
}


/**
 * @returns {Object} the enemy with rolling bomb from tagpro.players, if in view
 */
export function findEnemyRB() {
  return _.find(tagpro.players, player => (
    !playerIsOnMyTeam(player) &&
    player.bomb &&
    !player.dead &&
    player.draw
  ));
}


export function playerIsNearPoint(player, point, distance = 300) {
  if (!(_.has(player, 'x') && _.has(player, 'y'))) return false;
  return point.distance(new Point(player.x, player.y)) <= distance;
}


export function getEnemyPlayersNearAllyFlagStation() {
  const base = findAllyFlagStation();
  const basePos = new Point(base.xp, base.yp);
  return _.filter(tagpro.players, player => (
    !playerIsOnMyTeam(player) &&
    playerIsNearPoint(player, basePos)
  ));
}


/**
 * @param {Object[]} players - an array of players from tagpro.players
 * @param {Point} point
 * @returns {Object} the player from players that is closest to point
 */
export function getPlayerClosestToPoint(players, point) {
  return _.min(players, player => point.distance(new Point(player.x, player.y)));
}
