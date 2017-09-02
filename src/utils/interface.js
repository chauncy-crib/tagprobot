import { clearSprites, drawPermanentNTSprites } from '../draw/drawings';


const KEY_CODES = {
  H: 72,
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
export function isAutonomousMode() {
  return autonomous;
}


let visuals = true;
export function isVisualMode() {
  return visuals;
}


export function chatHelpMenu() {
  const menu = [
    '--- Help Menu',
    '--- H: print this help menu',
    '--- Q: toggle autonomous mode',
    '--- V: toggle visuals',
    '---',
  ];
  menu.forEach(item => {
    chat(item);
  });
}


/*
 * Sends key events to move in a list of directions.
 *
 * @param {Object} directions - directions to move
 * @param {(string|undefined)} directions.x - either 'RIGHT', 'LEFT', or undefined
 * @param {(string|undefined)} directions.y - either 'DOWN', 'UP', or undefined
 */
function press(directions) {
  switch (directions.x) {
    case 'RIGHT':
      tagpro.sendKeyPress('right', false);
      tagpro.sendKeyPress('left', true);
      break;
    case 'LEFT':
      tagpro.sendKeyPress('left', false);
      tagpro.sendKeyPress('right', true);
      break;

    default:
      tagpro.sendKeyPress('left', true);
      tagpro.sendKeyPress('right', true);
      break;
  }

  switch (directions.y) {
    case 'DOWN':
      tagpro.sendKeyPress('down', false);
      tagpro.sendKeyPress('up', true);
      break;
    case 'UP':
      tagpro.sendKeyPress('up', false);
      tagpro.sendKeyPress('down', true);
      break;

    default:
      tagpro.sendKeyPress('up', true);
      tagpro.sendKeyPress('down', true);
      break;
  }
}


export function onKeyDown(event) {
  switch (event.keyCode) {
    // Chat the help menu
    case KEY_CODES.H: {
      chatHelpMenu();
      break;
    }
    // If letter pressed is Q, toggle autonomous controls
    case KEY_CODES.Q: {
      autonomous = !autonomous;
      press({}); // Release all keys
      const autonomyMode = autonomous ? 'AUTONOMOUS' : 'MANUAL';
      chat(`Autonomy mode updated: now ${autonomyMode}!`);
      break;
    }
    // Toggle visuals
    case KEY_CODES.V: {
      visuals = !visuals;
      const chatMsg = visuals ? 'ENABLED' : 'DISABLED';
      chat(`Visual mode update: now ${chatMsg}!`);
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
  const directions = {};

  if (destination.x > deadband) {
    directions.x = 'RIGHT';
  } else if (destination.x < -deadband) {
    directions.x = 'LEFT';
  }

  if (destination.y > deadband) {
    directions.y = 'DOWN';
  } else if (destination.y < -deadband) {
    directions.y = 'UP';
  }

  press(directions);
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
