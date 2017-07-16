import _ from 'lodash';

import { teams, tileTypes } from '../constants';

let me;

// Sets up the "me" player for this helper file.
export function setupMe() {
  me = tagpro.players[tagpro.playerId];
}

export function getMe() {
  return me;
}

export function amBlue() {
  return me.team === teams.BLUE;
}

export function amRed() {
  return me.team === teams.RED;
}

function isOnMyTeam(player) {
  return player.team === me.team;
}

// Returns the enemy FC if in view.
export function getEnemyFC() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    player.flag &&
    !player.dead &&
    player.draw
  ));
}

// Returns an enemy if in view
export function getEnemy() {
  return _.find(tagpro.players, player => (
    !isOnMyTeam(player) &&
    !player.dead &&
    player.draw
  ));
}

export function getMyEndzoneTile() {
  return amBlue() ? tileTypes.BLUE_ENDZONE : tileTypes.RED_ENDZONE;
}

// Returns whether or not ally team's flag is taken
export function isAllyFlagTaken() {
  return amBlue() ? tagpro.ui.blueFlagTaken : tagpro.ui.redFlagTaken;
}
