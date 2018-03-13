import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';


// FIFO queue for delaying chat messages
const messageQueue = [];

const KEY_WORDS = {
  inform: {
    role: 'TPBIR',
  },
  command: {
    role: 'TPBCR',
  },
};


/**
 * Enqueues the message in the message queue to be chatted when appropriate.
 * @param {string} message - the message to chat
 */
export function chat(message) {
  messageQueue.push(message);
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
    tagpro.socket.emit('chat', {
      message: messageQueue.shift(), // Dequeue the first message
      toAll: 0,
    });
    lastMessageTime = now;
  }
}


/**
 * Checks the first word in the given chat data for a key word and reacts appropriately.
 * @param {(number|null)} chatData.from - the index of the player who sent the message or null if
 *   the message is a system message
 * @param {string} chatData.message - the message sent
 * @param {string} chatData.to - the recipients of the message ('all', 'team', or 'group')
 * @param {string} chatData.c - the hex representation of the color to change the text to (for
 *   example for flair awards)
 * @param {boolean} chatData.mod - whether or not the sender of the message is a mod
 */
export function parseChat(chatData) {
  const msg = chatData.message;
  if (msg.indexOf(' ') === -1) return; // no space found

  const firstWord = msg.substr(0, msg.indexOf(' ') + 1);
  switch (firstWord) {
    case KEY_WORDS.inform.role:
      // TODO
      break;
    case KEY_WORDS.command.role:
      // TODO
      break;
    default:
      // TODO
  }
}


/**
 * Define a function to run every time a message is sent to the TagPro chat
 */
export function setupChatCallback() {
  tagpro.socket.on('chat', parseChat);
}
