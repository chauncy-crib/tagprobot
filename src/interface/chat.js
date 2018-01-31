import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';


// FIFO queue for delaying chat messages
const messageQueue = [];

/**
 * Enqueues the message in the message queue to be chatted when appropriate.
 * @param {string} message - the message to chat
 */
export function chat(message) {
  messageQueue.push(message);
}


// TagPro keeps you from sending a chat message faster than every
// 500ms. This delay accounts for that plus a 100ms buffer.
const chatDelay = 500 + 100;

// Keep track of the time the last message was sent
let lastMessageTime = 0;

/**
 * Checks if we've waited long enough since the last message was chatted, and
 * if so chats the first thing in the queue if it exists.
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


export function chatHelpMenu() {
  const menu = [
    '--- Help Menu',
    '--- H: print this help menu',
    '--- Q: toggle autonomous mode',
    '--- V: Draw all/Clear all',
    '--- N: toggle triangles',
    '--- L: toggle paths',
    '--- P: toggle triangle dual-graph',
    '--- R: toggle traversability',
    '--- K: toggle keypresses',
    '---',
  ];
  menu.forEach(item => {
    chat(item);
  });
}
