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

let AUTONOMOUS = true;

export function isAutonomous() {
  return AUTONOMOUS;
}

export function onKeyDown(event) {
  // If letter pressed is Q, toggle autonomous controls
  if (event.keyCode === 81) {
    AUTONOMOUS = !AUTONOMOUS;
    tagpro.sendKeyPress('up', true);
    tagpro.sendKeyPress('down', true);
    tagpro.sendKeyPress('left', true);
    tagpro.sendKeyPress('right', true);
    if (AUTONOMOUS) {
      chat('Autonomy Mode updated: now AUTONOMOUS!');
    } else {
      chat('Autonomy Mode updated: now MANUAL!');
    }
    setTimeout(() => { console.log(`Autonomy status: ${AUTONOMOUS}`); }, 200);
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
