import { clearSprites, drawPermanentNTSprites } from '../draw/drawings';


const KEY_CODES = {
  H: 72,
  M: 77,
  Q: 81,
  V: 86,
};


let lastMessage = 0;
export function chat(chatMessage) {
  // Seems that TagPro keeps you from sending a chat message faster than every
  // 500ms. This limit accounts for that plus a 100ms buffer.
  const limit = 500 + 100;
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
export function isAutonomous() {
  return autonomous;
}


let mobile = true;
export function isMobile() {
  return mobile;
}


let visuals = true;
export function areVisualsOn() {
  return visuals;
}


export function chatHelpMenu() {
  const menu = [
    '--- Help Menu',
    '--- H: print this help menu',
    '--- Q: toggle autonomous mode',
    '--- M: toggle mobility',
    '--- V: toggle visuals',
    '---',
  ];
  menu.forEach(item => {
    chat(item);
  });
}


/*
 * Set the state of all arrow keys to no longer be pressed
 */
export function releaseArrowKeys() {
  tagpro.sendKeyPress('up', true);
  tagpro.sendKeyPress('down', true);
  tagpro.sendKeyPress('left', true);
  tagpro.sendKeyPress('right', true);
}


export function onKeyDown(event) {
  switch (event.keyCode) {
    // Chat the help menu
    case KEY_CODES.H: {
      chatHelpMenu();
      break;
    }
    // Toggle bot mobility
    case KEY_CODES.M: {
      mobile = !mobile;
      releaseArrowKeys();
      const mobility = mobile ? 'MOBILE' : 'IMMOBILE';
      chat(`Mobility Updated: now ${mobility}!`);
      break;
    }
    // If letter pressed is Q, toggle autonomous controls
    case KEY_CODES.Q: {
      autonomous = !autonomous;
      visuals = autonomous;
      if (!visuals) {
        clearSprites();
      } else {
        drawPermanentNTSprites();
      }
      releaseArrowKeys();
      const autonomyMode = autonomous ? 'AUTONOMOUS' : 'MANUAL';
      chat(`Autonomy Mode updated: now ${autonomyMode}!`);
      break;
    }
    // Toggle visuals
    case KEY_CODES.V: {
      visuals = !visuals;
      const chatMsg = visuals ? 'ENABLED' : 'DISABLED';
      chat(`Visuals ${chatMsg}!`);
      if (!visuals) {
        clearSprites();
      } else {
        drawPermanentNTSprites();
      }
      break;
    }
    default:
  }
}


/*
 * Sends key events to move to a destination.
 *
 * @param {Object} destination - object with the position to move to, in pixels,
 * x and y
 */
export function move(destination) {
  // TODO: address deadband variable with a comment
  const deadband = 4;
  if (destination.x > deadband) {
    tagpro.sendKeyPress('left', true);
    tagpro.sendKeyPress('right', false);
  } else if (destination.x < -deadband) {
    tagpro.sendKeyPress('right', true);
    tagpro.sendKeyPress('left', false);
  } else {
    tagpro.sendKeyPress('right', true);
    tagpro.sendKeyPress('left', true);
  }

  if (destination.y > deadband) {
    tagpro.sendKeyPress('up', true);
    tagpro.sendKeyPress('down', false);
  } else if (destination.y < -deadband) {
    tagpro.sendKeyPress('down', true);
    tagpro.sendKeyPress('up', false);
  } else {
    tagpro.sendKeyPress('up', true);
    tagpro.sendKeyPress('down', true);
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
    tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 55;
    tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 55;
    return this.m_linearVelocity;
  };
}
