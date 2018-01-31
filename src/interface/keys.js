import { chat, chatHelpMenu } from './chat';
import { clearSprites, turnOnAllDrawings } from '../draw/draw';
import { drawKeyPresses, currKeyPresses, toggleKeyPressVis } from '../draw/keys';
import {
  toggleTraversabilityVis,
  toggleTriangulationVis,
  togglePolypointVis,
  togglePathVis,
} from '../draw/triangulation';


const KEY_CODES = {
  H: 72,
  K: 75,
  L: 76,
  P: 80,
  Q: 81,
  R: 82,
  N: 78,
  V: 86,
};


let autonomous = true;
export function isAutonomousMode() {
  return autonomous;
}


let visuals = true;
export function isVisualMode() {
  return visuals;
}


/**
 * Sends key events to move in a list of directions.
 * @param {{x: string, y: string}} directions - directions to move
 * @param {(string|undefined)} directions.x - either 'RIGHT', 'LEFT', or undefined
 * @param {(string|undefined)} directions.y - either 'DOWN', 'UP', or undefined
 */
function press(directions) {
  if (directions.x !== currKeyPresses.x) {
    tagpro.sendKeyPress('left', directions.x !== 'LEFT');
    tagpro.sendKeyPress('right', directions.x !== 'RIGHT');
  }

  if (directions.y !== currKeyPresses.y) {
    tagpro.sendKeyPress('down', directions.y !== 'DOWN');
    tagpro.sendKeyPress('up', directions.y !== 'UP');
  }

  drawKeyPresses(directions); // only updates drawings that need to be updated

  // Update the global key presses state
  currKeyPresses.x = directions.x;
  currKeyPresses.y = directions.y;
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
      press({ x: null, y: null }); // Release all keys
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
        turnOnAllDrawings();
      }
      break;
    }
    case KEY_CODES.K: {
      toggleKeyPressVis();
      break;
    }
    case KEY_CODES.R: {
      toggleTraversabilityVis();
      break;
    }
    case KEY_CODES.N: {
      toggleTriangulationVis();
      break;
    }
    case KEY_CODES.P: {
      togglePolypointVis();
      break;
    }
    case KEY_CODES.L: {
      togglePathVis();
      break;
    }
    default:
  }
}


/**
 * Uses random numbers to decide which keys to press, based on desired acceleration multiplier
 *   values.
 * @param {{accX: number, accY: number}} accelValues - The acceleration multipliers to achieve with
 *   arrow key presses. Positive directions are down and right.
 */
export function move(accelValues) {
  const directions = {};
  if (Math.random() < Math.abs(accelValues.accX)) {
    directions.x = accelValues.accX > 0 ? 'RIGHT' : 'LEFT';
  }
  if (Math.random() < Math.abs(accelValues.accY)) {
    directions.y = accelValues.accY > 0 ? 'DOWN' : 'UP';
  }
  press(directions);
}
