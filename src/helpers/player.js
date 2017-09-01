import { teams } from '../constants';

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

export function isOnMyTeam(player) {
  return player.team === me.team;
}

export function getAllyEndzoneTileName() {
  return amBlue() ? 'BLUE_ENDZONE' : 'RED_ENDZONE';
}

export function getEnemyEndzoneTileName() {
  return amBlue() ? 'RED_ENDZONE' : 'BLUE_ENDZONE';
}

// Returns whether or not ally team's flag is taken
export function isAllyFlagTaken() {
  return amBlue() ? tagpro.ui.blueFlagTaken : tagpro.ui.redFlagTaken;
}
