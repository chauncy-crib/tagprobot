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


function playerIsSomeBall(player) {
  const name = player.name.split(' ');
  return name[0] === 'Some' && name[1] === 'Ball' && !_.isNan(parseInt(name[2], 10));
}


function playerRoleIsKnown(player) {
  return _.has(playerRoles, player.id);
}


/**
 * Remove roles for players that are no longer in the game and add ROLES.NOT_DEFINED roles for each
 *   player that think is not a bot
 */
function cleanTeammateRoles() {
  // Remove roles for players that are no longer in the game
  _.forEach(_.keys(playerRoles), playerId => {
    if (!_.has(tagpro.players, playerId)) delete playerRoles[playerId];
  });

  // Add ROLES.NOT_DEFINED roles to players that aren't bots
  _.forEach(tagpro.players, player => {
    // if (playerIsOnMyTeam(player) && !playerRoleIsKnown(player) && !playerIsSomeBall(player)) {
    if (playerIsOnMyTeam(player) && !playerRoleIsKnown(player)) {
      playerRoles[player.id] = ROLES.NOT_DEFINED;
    }
  });
}


export function requestTeammateRoles() {
  _.forEach(tagpro.players, player => {
    if (playerIsOnMyTeam(player) && !playerRoleIsKnown(player) && playerIsSomeBall(player)) {
      sendMessageToChat(CHATS.TEAM, `${KEY_WORDS.REQUEST.ROLE} ${player.id}`);
    }
  });
}


export function getNumTeammates() {
  let numTeammates = 0;
  _.forEach(tagpro.players, player => {
    if (playerIsOnMyTeam(player) && !playerIsMe(player)) numTeammates += 1;
  });
  return numTeammates;
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
  return _.every(getTeammatesWithLowerIds(), player => playerRoles[player.id] !== ROLES.NOT_DEFINED);
}


/**
 * Define own role based on teammate's roles.
 */
export function assumeComplementaryRole() {
  let numOffense = 0;
  let numDefense = 0;

  _.forEach(playerRoles, playerRole => {
    if (playerRole === ROLES.OFFENSE) numOffense += 1;
    else if (playerRole === ROLES.DEFENSE) numDefense += 1;
  });
  if (numDefense < numOffense) playerRoles[getMe().id] = ROLES.DEFENSE;
  else playerRoles[getMe().id] = ROLES.OFFENSE;

  sendMessageToChat(CHATS.TEAM, `${KEY_WORDS.INFORM.ROLE} ${playerRoles[getMe().id]}`);
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
