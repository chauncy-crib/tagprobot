import { teams } from '../constants';
import { getId } from '../tiles';

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

export function getMyEndzoneTile() {
  return amBlue() ? getId('BLUE_ENDZONE') : getId('RED_ENDZONE');
}

export function getEnemyEndzoneTile() {
  return amBlue() ? getId('RED_ENDZONE') : getId('BLUE_ENDZONE');
}

// Returns whether or not ally team's flag is taken
export function isAllyFlagTaken() {
  return amBlue() ? tagpro.ui.blueFlagTaken : tagpro.ui.redFlagTaken;
}

// For testing purposes.  Sets me.team to input color
export function mockMe(color) {
  me = { team: color };
}
