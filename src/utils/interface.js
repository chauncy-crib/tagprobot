import { clearSprites, drawPermanentNTSprites } from '../draw/drawings';


const KEY_CODES = { Q: 81, V: 86 };

// Stole this function to send chat messages
let lastMessage = 0;
export function chat(chatMessage) {
  const limit = 500 + 10;
  const now = new Date();
  const timeDiff = now - lastMessage;
  if (timeDiff > limit) {
    tagpro.socket.emit('chat', {
      message: chatMessage,
      toAll: 0,
    });
    lastMessage = new Date();
  } else if (timeDiff >= 0) {
    setTimeout(chat, limit - timeDiff, chatMessage);
  }
}

let autonomous = true;
let visuals = true;

export function isAutonomous() {
  return autonomous;
}

export function areVisualsOn() {
  return visuals;
}

export function onKeyDown(event) {
  // If letter pressed is Q, toggle autonomous controls
  if (event.keyCode === KEY_CODES.Q) {
    autonomous = !autonomous;
    visuals = autonomous;
    if (!visuals) {
      clearSprites();
    } else {
      drawPermanentNTSprites();
    }
    tagpro.sendKeyPress('up', true);
    tagpro.sendKeyPress('down', true);
    tagpro.sendKeyPress('left', true);
    tagpro.sendKeyPress('right', true);
    const autonomyMode = autonomous ? 'autonomous' : 'MANUAL';
    chat(`Autonomy Mode updated: now ${autonomyMode}!`);
    setTimeout(() => { console.log(`Autonomy status: ${autonomous}`); }, 200);
  }
  if (event.keyCode === KEY_CODES.V) { // toggle visuals
    visuals = !visuals;
    const chatMsg = visuals ? 'enabled' : 'disabled';
    chat(`Visuals ${chatMsg}`);
    if (!visuals) {
      clearSprites();
    } else {
      drawPermanentNTSprites();
    }
  }
}


/*
 * Takes in an integer from 0-8, representing one of 9 directions in the grid below:
 *
 * 0 | 1 | 2
 * ---------
 * 3 | 4 | 5
 * ---------
 * 6 | 7 | 8
 *
 * and send the corresponding keypress events to tagpro
 *
 */
export function seekTowardDirection(direction) {
  const directions = [
    // hold left, and up, nothing, down
    { x: -1, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    // hold nothing, and up, nothing, down
    { x: 0, y: -1 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    // hold right, and up, nothing, down
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ];
  // TODO: these keypresses seem backward from the directions listed above, but when running the
  // bot, it seeks toward the correct thing.
  switch (directions[direction].x) {
    case 1:
      tagpro.sendKeyPress('left', true);
      tagpro.sendKeyPress('right', false);
      break;
    case 0:
      tagpro.sendKeyPress('left', false);
      tagpro.sendKeyPress('right', false);
      break;
    case -1:
      tagpro.sendKeyPress('left', false);
      tagpro.sendKeyPress('right', true);
      break;
    default:
      throw new Error('Invalid seeking direction');
  }
  switch (directions[direction].y) {
    case 1:
      tagpro.sendKeyPress('up', true);
      tagpro.sendKeyPress('down', false);
      break;
    case 0:
      tagpro.sendKeyPress('up', false);
      tagpro.sendKeyPress('down', false);
      break;
    case -1:
      tagpro.sendKeyPress('up', false);
      tagpro.sendKeyPress('down', true);
      break;
    default:
      throw new Error('Invalid seeking direction');
  }
}


/*
 * Overriding this function to get a more accurate velocity of players.
 * Velocity is saved in player.vx and vy. The refresh rate on our access to server size physics is
 * only 4 Hz. We can check our client-side velocity at a much higher refresh rate (60 Hz), so we use
 * this and store it in the me object.
 * Units are in meters/second. 1 meter = 2.5 tiles.
 */
export function setupVelocity() {
  Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function accurateVelocity() {
    tagpro.players[this.player.id].vx = this.m_linearVelocity.x;
    tagpro.players[this.player.id].vy = this.m_linearVelocity.y;
    return this.m_linearVelocity;
  };
}
