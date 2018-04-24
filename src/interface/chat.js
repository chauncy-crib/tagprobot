import _ from 'lodash';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

import { assert } from '../global/utils';
import { ROLES } from '../look/constants';
import {
  playerRoles,
  idIsMine,
  getMyRole,
  isMyTurnToAssumeRole,
  assumeComplementaryRole,
} from '../look/gameState';
import { CHATS, KEY_WORDS } from './constants';


// FIFO queue for delaying chat messages
const messageQueue = []; // {chat: string, message: string}[]


/**
 * Enqueues the message in the message queue to be chatted when appropriate.
 * @chat {'ALL'|'TEAM'} chat - the chat channel to send the message to
 * @param {string} message - the message to chat
 */
export function sendMessageToChat(chat, message) {
  assert(_.has(CHATS, chat), `tried to send message to non-existent chat: ${chat}`);
  messageQueue.push({ chat, message });
}


// TagPro keeps you from sending a chat message faster than every 500ms. This delay accounts for
//   that plus a 100ms buffer.
const chatDelay = 500 + 100;

// Keep track of the time the last message was sent
let lastMessageTime = 0;

/**
 * Checks if we've waited long enough since the last message was chatted, and if so chats the first
 *   thing in the queue if it exists.
 */
export function dequeueChatMessages() {
  const now = new Date();
  const timeDiff = differenceInMilliseconds(now, lastMessageTime);

  if (messageQueue.length && timeDiff > chatDelay) {
    const chatData = messageQueue.shift(); // dequeue the first message
    tagpro.socket.emit('chat', {
      message: chatData.message,
      toAll: chatData.chat === CHATS.ALL,
    });
    lastMessageTime = now;
  }
}


/**
 * Checks the first word in the given chat data for a key word and reacts appropriately. The
 *   chatData object used in this function is dictated by TagPro.
 * @param {(number|null)} chatData.from - the index of the player who sent the message or null if
 *   the message is a system message
 * @param {string} chatData.message - the message sent
 * @param {string} chatData.to - the recipients of the message ('all', 'team', or 'group')
 * @param {string} chatData.c - the hex representation of the color to change the text to (for
 *   example for flair awards)
 * @param {boolean} chatData.mod - true if sender of message is a mod
 */
function parseChatForCommunication(chatData) {
  const msg = chatData.message.split(' ');
  const firstWord = msg[0];
  switch (firstWord) {
    case KEY_WORDS.INFORM.ROLE: {
      const role = msg[1];
      assert(
        _.has(ROLES, role),
        `received ${KEY_WORDS.INFORM.ROLE} second parameter that was non-role: ${role}`,
      );
      playerRoles[chatData.from] = role;
      if (
        !idIsMine(chatData.from) &&
        getMyRole() === ROLES.NOT_DEFINED &&
        isMyTurnToAssumeRole()
      ) {
        assumeComplementaryRole();
      }
      break;
    } case KEY_WORDS.REQUEST.ROLE: {
      const playerId = parseInt(msg[1], 10);
      assert(
        !_.isNaN(playerId),
        `received ${KEY_WORDS.REQUEST.ROLE} first parameter that was non-number: ${msg[1]}`,
      );
      if (idIsMine(playerId)) {
        sendMessageToChat(CHATS.TEAM, `${KEY_WORDS.INFORM.ROLE} ${playerRoles[playerId]}`);
      }
      break;
    } case KEY_WORDS.COMMAND.ROLE: {
      const playerId = parseInt(msg[1], 10);
      assert(
        !_.isNaN(playerId),
        `received ${KEY_WORDS.COMMAND.ROLE} second parameter that was non-number: ${msg[1]}`,
      );
      const role = msg[2];
      assert(
        _.has(ROLES, role),
        `received ${KEY_WORDS.COMMAND.ROLE} third parameter that was non-role: ${role}`,
      );
      if (idIsMine(playerId)) {
        playerRoles[playerId] = role;
        sendMessageToChat(CHATS.TEAM, `${KEY_WORDS.INFORM.ROLE} ${role}`);
      }
      break;
    } default:
  }
}


/**
 * Define a function to run every time a message is sent to the TagPro chat
 */
export function setupChatCallback() {
  tagpro.socket.on('chat', parseChatForCommunication);
}
