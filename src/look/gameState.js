import _ from 'lodash';

import { TEAMS, ROLES } from './constants';
import { findCachedTile } from './tileLocations';
import { CHATS, KEY_WORDS } from '../interface/constants';
import { sendMessageToChat } from '../interface/chat';


let me;
let currGameIsCenterFlag;

export const playerRoles = {};


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


export function playerIsOnMyTeam(player) {
  return player.team === me.team;
}


export function idIsMine(id) {
  return id === getMe().id;
}


export function playerIsMe(player) {
  return idIsMine(player.id);
}


function playerRoleIsKnown(player) {
  return _.has(playerRoles, player.id);
}


export function getMyRole() {
  return playerRoles[getMe().id];
}


export function setMyRole(role) {
  playerRoles[getMe().id] = role;
}


/**
 * Remove roles for players that are no longer in the game and assign ROLES.NOT_DEFINED roles for
 *   each teammate whose role we do not know
 */
export function cleanTeammateRoles() {
  // Remove roles for players that are no longer in the game
  _.forEach(_.keys(playerRoles), playerId => {
    if (!_.has(tagpro.players, playerId)) delete playerRoles[playerId];
  });

  // Assign ROLES.NOT_DEFINED roles to teammates whose roles we don't know yet
  _.forEach(tagpro.players, player => {
    if (playerIsOnMyTeam(player) && !playerRoleIsKnown(player)) {
      playerRoles[player.id] = ROLES.NOT_DEFINED;
    }
  });
}


export function requestTeammateRoles() {
  _.forEach(tagpro.players, player => {
    if (playerIsOnMyTeam(player) && !playerRoleIsKnown(player)) {
      sendMessageToChat(CHATS.TEAM, `${KEY_WORDS.REQUEST.ROLE} ${player.id}`);
    }
  });
}


export function getNumTeammates() {
  return _.filter(tagpro.players, player => playerIsOnMyTeam(player) && !playerIsMe(player)).length;
}


export function getNumOtherPlayers() {
  return _.filter(tagpro.players, player => !playerIsMe(player)).length;
}


function getTeammatesWithLowerIds() {
  return _.filter(tagpro.players, player => playerIsOnMyTeam(player) && player.id < getMe().id);
}


/*
 * @returns true if this bot is the lowest ID without an assigned role
 */
export function isMyTurnToAssumeRole() {
  cleanTeammateRoles();
  return _.every(
    getTeammatesWithLowerIds(),
    player => playerRoles[player.id] !== ROLES.NOT_DEFINED,
  );
}


/**
 * Define own role based on teammate's roles.
 */
export function assumeComplementaryRole() {
  const roleCount = _.countBy(playerRoles);
  if (_.get(roleCount, ROLES.DEFENSE, 0) < _.get(roleCount, ROLES.OFFENSE, 0)) {
    setMyRole(ROLES.DEFENSE);
  } else {
    setMyRole(ROLES.OFFENSE);
  }
  sendMessageToChat(CHATS.TEAM, `${KEY_WORDS.INFORM.ROLE} ${getMyRole()}`);
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
