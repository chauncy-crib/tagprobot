import { TEAMS } from './constants';
import { findCachedTile } from './locations';


let me;
let currGameIsCenterFlag;


export function initMe() {
  me = tagpro.players[tagpro.playerId];
}


export function getMe() {
  return me;
}


export function amBlue() {
  return me.team === TEAMS.BLUE;
}


export function amRed() {
  return me.team === TEAMS.RED;
}


export function isOnMyTeam(player) {
  return player.team === me.team;
}


export function initIsCenterFlag() {
  currGameIsCenterFlag = findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']) !== null;
}


export function isCenterFlag() {
  return currGameIsCenterFlag;
}


export function myTeamHasFlag() {
  return amBlue()
    ? tagpro.ui.yellowFlagTakenByBlue
    : tagpro.ui.yellowFlagTakenByRed;
}


export function enemyTeamHasFlag() {
  return amBlue()
    ? tagpro.ui.yellowFlagTakenByRed
    : tagpro.ui.yellowFlagTakenByBlue;
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


export function getEnemyGoal() {
  if (isCenterFlag()) {
    return amBlue() ?
      findCachedTile('RED_ENDZONE') :
      findCachedTile('BLUE_ENDZONE');
  }
  return amBlue() ? findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
    findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
}
