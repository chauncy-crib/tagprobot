
import { accel, maxSpeed, dampingFactor, PPTL } from '../constants';


function desiredAcceleration(x, y, vx, yp, destX, destY) {

}

/**
 * Using constant acceleration equations, return next position
 *
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
 *
 * @param {number} v - velocity
 * @param {number} a - acceleration
 * @param {number} t - time
 * @returns {number} velcity after t time
 */
function nextVelocity(v, a, t) {
  return v + (a * t);
}

/**
 * Given the current state of the bot, return the next position and velocity assuming you hold a
 * key for a timestep
 *
 * @param {number} xp - x position, pixels
 * @param {number} yp - y position, pixels
 * @param {number} vxp - x-velocity, pixels/second
 * @param {number} vyp - y-velocity, pixels/second
 * @param {Object} keypress
 * @param {(string|undefined)} keypress.x - either 'RIGHT', 'LEFT', or undefined
 * @param {(string|undefined)} keypress.y - either 'DOWN', 'UP', or undefined
 * @param {number} timeStep - seconds between current and projected state
 * @returns {Object}
 */
// eslint-disable-next-line import/prefer-default-export
export function projectedState(xp, yp, vxp, vyp, keypress, timeStep) {
  // acceleration as a result of friction
  const dampingDecelX = -vxp * dampingFactor;
  const dampingDecelY = -vyp * dampingFactor;
  // acceleration from keypress
  let keypressAccelX = accel;
  let keypressAccelY = accel;
  if (keypress.x === 'RIGHT') keypressAccelX *= 1;
  else if (keypress.x === 'LEFT') keypressAccelX *= -1;
  else keypressAccelX *= 0;
  if (keypress.y === 'DOWN') keypressAccelY *= 1;
  else if (keypress.y === 'UP') keypressAccelY *= -1;
  else keypressAccelY *= 0;
  const netAccelX = keypressAccelX + dampingDecelX;
  const netAccelY = keypressAccelY + dampingDecelY;
  return {
    xp: nextPosition(xp, vxp, netAccelX, timeStep),
    yp: nextPosition(yp, vyp, netAccelY, timeStep),
    vxp: Math.max(
      Math.min(nextVelocity(vxp, netAccelX, timeStep), maxSpeed),
      -maxSpeed,
    ),
    vyp: Math.max(
      Math.min(nextVelocity(vyp, netAccelY, timeStep), maxSpeed),
      -maxSpeed,
    ),
  };
}
