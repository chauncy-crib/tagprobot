import _ from 'lodash';

import { ROLES } from './constants';
import { getMe, playerIsOnMyTeam } from './gameState';
import { CHATS, KEY_WORDS } from '../interface/constants';
import { sendMessageToChat } from '../interface/chat';


export const playerRoles = {};


function playerRoleIsKnown(player) {
  return _.has(playerRoles, player.id);
}


export function getMyRole() {
  return playerRoles[getMe().id];
}


export function setMyRole(role) {
  playerRoles[getMe().id] = role;
}


function getTeammatesWithLowerIds() {
  return _.filter(tagpro.players, player => playerIsOnMyTeam(player) && player.id < getMe().id);
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


/**
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
