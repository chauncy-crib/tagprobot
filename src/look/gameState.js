import _ from 'lodash';

import { TEAMS } from './constants';
import { findCachedTile } from './tileLocations';


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


export function getColor() {
  return amRed() ? 'RED' : 'BLUE';
}


export function playerIsOnMyTeam(player) {
  return player.team === me.team;
}

/**
 * @returns {Object} all enemy players
 */
export function getEnemies() {
  return _.reject(tagpro.players, player => playerIsOnMyTeam(player));
}


export function idIsMine(id) {
  return id === getMe().id;
}


export function playerIsMe(player) {
  return idIsMine(player.id);
}


export function getNumTeammates() {
  return _.filter(tagpro.players, player => playerIsOnMyTeam(player) && !playerIsMe(player)).length;
}


export function initIsCenterFlag() {
  currGameIsCenterFlag = findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']) !== null;
}


export function isCenterFlag() {
  return currGameIsCenterFlag;
}


export function myTeamHasFlag() {
  if (isCenterFlag()) {
    return amBlue() ? tagpro.ui.yellowFlagTakenByBlue : tagpro.ui.yellowFlagTakenByRed;
  }
  return amBlue() ? tagpro.ui.redFlagTaken : tagpro.ui.blueFlagTaken;
}


export function enemyTeamHasFlag() {
  if (isCenterFlag()) {
    return amBlue() ? tagpro.ui.yellowFlagTakenByRed : tagpro.ui.yellowFlagTakenByBlue;
  }
  return amBlue() ? tagpro.ui.blueFlagTaken : tagpro.ui.redFlagTaken;
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
