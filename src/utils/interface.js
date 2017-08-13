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
export function isAutonomous() {
  return autonomous;
}


let visuals = true;
export function areVisualsOn() {
  return visuals;
}


export function chatHelpMenu() {
  const menu = [
    'Help Menu -',
    'H: print this help menu',
    'Q: toggle autonomous mode',
    'V: toggle visual mode',
  ];
  menu.forEach(item => {
    chat(item);
  });
}


export function onKeyDown(event) {
  switch (event.keyCode) {
    case KEY_CODES.H: // chat the help menu
      chatHelpMenu();
      break;
    // If letter pressed is Q, toggle autonomous controls
    case KEY_CODES.Q: {
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
      break;
    }
    case KEY_CODES.V: { // toggle visuals
      visuals = !visuals;
      const chatMsg = visuals ? 'enabled' : 'disabled';
      chat(`Visuals ${chatMsg}`);
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


// Sends key events to move to a destination.
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
 * Velocity is saved in player.vx and vy.
 * TODO: better documentation for this function. Explain why its necessary. What is 55?
 */
export function setupVelocity() {
  Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function accurateVelocity() {
    tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 55;
    tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 55;
    return this.m_linearVelocity;
  };
}
