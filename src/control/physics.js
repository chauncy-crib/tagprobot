import { boundValue } from '../global/utils';
import { ACCEL, MAX_SPEED, DAMPING_FACTOR } from './constants';


/**
 * Using constant acceleration equations, return next position
 * @param {number} x - position
 * @param {number} v - velocity
 * @param {number} a - acceleration
 * @param {number} t - time
 * @returns {number} position after t time
 */
function nextPosition(x, v, a, t) {
  return x + (v * t) + (0.5 * a * (t ** 2));
}


/**
 * Using constant acceleration equations, return next velocity
 * @param {number} v - velocity
 * @param {number} a - acceleration
 * @param {number} t - time
 * @returns {number} velocity after t time
 */
function nextVelocity(v, a, t) {
  return v + (a * t);
}


/**
 * Given the current state of the bot, return the next position and velocity assuming you hold a
 *   key for a timestep
 * @param {number} xp - x position, pixels
 * @param {number} yp - y position, pixels
 * @param {number} vxp - x-velocity, pixels/second
 * @param {number} vyp - y-velocity, pixels/second
 * @param {Object} keypress
 * @param {(string|undefined)} keypress.x - either 'RIGHT', 'LEFT', or undefined
 * @param {(string|undefined)} keypress.y - either 'DOWN', 'UP', or undefined
 * @param {number} timeStep - seconds between current and projected state
 * @param {number} [accMultX=1] - a multiplier to apply to the acceleration resulting from
 *   the keypress in the x direction.
 * @param {number} [accMultY=1] - a multiplier to apply to the acceleration resulting from
 *   the keypress in the y direction.
 * @returns {{xp: number, yp: number, vxp: number, vyp: number}} the next state of the bot
 */
export function projectedState(xp, yp, vxp, vyp, keypress, timeStep, accMultX = 1, accMultY = 1) {
  // Acceleration as a result of friction
  const dampingDecelX = -vxp * DAMPING_FACTOR;
  const dampingDecelY = -vyp * DAMPING_FACTOR;

  // Acceleration from keypress
  let keypressAccelX = 0;
  let keypressAccelY = 0;
  if (keypress.x === 'RIGHT') keypressAccelX = ACCEL * accMultX;
  else if (keypress.x === 'LEFT') keypressAccelX = -ACCEL * accMultX;
  if (keypress.y === 'DOWN') keypressAccelY = ACCEL * accMultY;
  else if (keypress.y === 'UP') keypressAccelY = -ACCEL * accMultY;

  const netAccelX = keypressAccelX + dampingDecelX;
  const netAccelY = keypressAccelY + dampingDecelY;

  return {
    xp: nextPosition(xp, vxp, netAccelX, timeStep),
    yp: nextPosition(yp, vyp, netAccelY, timeStep),
    // Bound velocity by [-MAX_SPEED, MAX_SPEED]
    vxp: boundValue(nextVelocity(vxp, netAccelX, timeStep), -MAX_SPEED, MAX_SPEED),
    vyp: boundValue(nextVelocity(vyp, netAccelY, timeStep), -MAX_SPEED, MAX_SPEED),
  };
}


/**
 * Given a starting location/velocity in pixels, the keys to press, the multipliers for each
 *   direction, and the total time and timestep, return the final position/velocity.
 */
export function runSimulation(xp, yp, vxp, vyp, keypress, accMultX, accMultY, time, dt = 0.01) {
  let currX = xp;
  let currY = yp;
  let currVx = vxp;
  let currVy = vyp;
  let currTime = 0;
  while (currTime < time) {
    const nextState = projectedState(
      currX,
      currY,
      currVx,
      currVy,
      keypress,
      dt,
      accMultX,
      accMultY,
    );
    currX = nextState.xp;
    currY = nextState.yp;
    currVx = nextState.vxp;
    currVy = nextState.vyp;
    currTime += dt;
  }
  return { xp: currX, yp: currY, vxp: currVx, vyp: currVy };
}


/**
 * @param {number} pos - starting position in one coordinate
 * @param {number} vel - starting velocity in one direction
 * @param {number} targetPosition - target position, in one coordinate
 * @param {number} time - the number of seconds it should take to reach target
 * @param {number} threshold - the largest possible absolute difference between the return value and
 *   the true correct acceleration (default to 0.01)
 * @returns {number} how often (from -1.0-1.0) we should hold the arrow key in the direction of the
 *   target (negative numbers mean we should brake)
 */
export function binarySearchAcceleration(pos, vel, targetPosition, time, threshold = 0.01) {
  let lo = -1.0;
  let hi = 1.0;
  const step = 0.01;
  while (hi - lo > threshold) {
    const mid = (hi + lo) / 2;
    const position = runSimulation(pos, 0, vel, 0, { x: 'RIGHT' }, mid, 0, time, step).xp;
    if (position > targetPosition) { // overshot the target position
      hi = mid;
    } else { // undershot the target position
      lo = mid;
    }
  }
  return (hi + lo) / 2;
}


/**
 * @param {number} xp - starting x position
 * @param {number} yp - starting y position
 * @param {number} vxp - starting x velocity
 * @param {number} vyp - starting y velocity
 * @param {number} destXp - target x
 * @param {number} destYp - target y
 * @returns {{accX: number, accY: number, time: number}} The desired acceleration multipliers to
 *   reach the destination, and the time in seconds required to do so. The positive directions are
 *   down and right.
 */
export function getDesiredAccelerationMultipliers(xp, yp, vxp, vyp, destXp, destYp) {
  const flipX = xp > destXp;
  const flipY = yp > destYp;
  const step = 0.01; // simulation timestep
  // Put the target down and to the right of the current location
  // This makes the loop control easier because we know to hold DOWN and RIGHT
  const startX = flipX ? destXp : xp;
  const startY = flipY ? destYp : yp;
  const startVx = flipX ? -vxp : vxp;
  const startVy = flipY ? -vyp : vyp;
  const endX = flipX ? xp : destXp;
  const endY = flipY ? yp : destYp;
  let currX = startX;
  let currY = startY;
  let currVx = startVx;
  let currVy = startVy;
  let currTime = 0;
  // Simulate until we've overshot both directions
  while (currX <= endX || currY <= endY) {
    const nextState = projectedState(currX, currY, currVx, currVy, { y: 'DOWN', x: 'RIGHT' }, step);
    currX = nextState.xp;
    currY = nextState.yp;
    currVx = nextState.vxp;
    currVy = nextState.vyp;
    currTime += step;
  }

  const overshotX = (currX - endX) > (currY - endY);
  const overshotY = (currX - endX) < (currY - endY);
  const res = { accX: 1.0, accY: 1.0, time: currTime };
  // Binary search for the acceleration in the direction we reach more quickly in simulation
  if (overshotX) res.accX = binarySearchAcceleration(startX, startVx, endX, currTime);
  if (overshotY) res.accY = binarySearchAcceleration(startY, startVy, endY, currTime);
  // Undo the flips we did at the start
  if (flipX) res.accX *= -1;
  if (flipY) res.accY *= -1;

  return res;
}
