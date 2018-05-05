import _ from 'lodash';

import { assert } from '../global/utils';
import { BRP } from '../global/constants';
import { playerIsOnMyTeam } from './gameState';
import { findAllyFlagStation } from './tileLocations';
import { Point } from '../interpret/class/Point';


/**
 * @returns {Object} the enemy flag carrier from tagpro.players, if in view
 */
export function getEnemyFC() {
  return _.find(tagpro.players, player => (
    !playerIsOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw // if the player is visible in the client's view
  ));
}


/**
 * @returns {Object} the enemy with rolling bomb from tagpro.players, if in view
 */
export function getEnemyRB() {
  return _.find(tagpro.players, player => (
    !playerIsOnMyTeam(player) &&
    player.bomb &&
    !player.dead &&
    player.draw // if the player is visible in the client's view
  ));
}


/**
 * @returns {Point}
 */
export function getPlayerCenter(player) {
  assert(
    _.has(player, 'x') && _.has(player, 'y'),
    'tried to get the center of a player who does not have an x and y attribute',
  );
  return new Point(player.x + BRP, player.y + BRP);
}


export function playerIsNearPoint(player, point, threshold = 300) {
  return point.distance(getPlayerCenter(player)) <= threshold;
}


export function getEnemyPlayersNearAllyFlagStation() {
  const allyFlagStation = findAllyFlagStation();
  return _.filter(tagpro.players, player => (
    !playerIsOnMyTeam(player) &&
    playerIsNearPoint(player, allyFlagStation)
  ));
}


/**
 * @param {Object[]} players - an array of players from tagpro.players
 * @param {Point} point
 * @returns {Object} the player from players that is closest to point
 */
export function getPlayerClosestToPoint(players, point) {
  return _.min(players, player => point.distance(getPlayerCenter(player)));
}


/**
 * Placeholder for the get post-grab pop position function
 * @returns {Point} the position to be in such that when the specified player
 *   grabs the flag, you will pop them as soon as their 0.25 seconds of invulnerability are over
 */
export function getPGPPosition(player) { // eslint-disable-line
  return findAllyFlagStation();
}
