import _ from 'lodash';

import { teams, tileTypes } from '../constants';

let myTeam;

/*
 * Sets the team for this helper file.
 * team: an int, either teams.RED or teams.BLUE
 */
export function setTeam(team) {
  myTeam = team;
}

export function amBlue() {
  return myTeam === teams.BLUE;
}

export function amRed() {
  return myTeam === teams.RED;
}

function isOnMyTeam(player) {
  return player.team === myTeam;
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
