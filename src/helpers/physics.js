import { accel, maxSpeed, dampingFactor } from '../constants';


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
 * @param {number} accelerationMultiplier - a multiplier to apply to the acceleration resulting from
 *   the keypress. Default to 1
 * @returns {{xp: number, yp: number, vxp: number, vyp: number}} the next state of the bot
 */
// eslint-disable-next-line import/prefer-default-export
export function projectedState(xp, yp, vxp, vyp, keypress, timeStep, accelerationMultiplier = 1) {
  // acceleration as a result of friction
  const dampingDecelX = -vxp * dampingFactor;
  const dampingDecelY = -vyp * dampingFactor;

  // acceleration from keypress
  let keypressAccelX = accel;
  let keypressAccelY = accel;
  if (keypress.x === 'RIGHT') keypressAccelX *= accelerationMultiplier;
  else if (keypress.x === 'LEFT') keypressAccelX *= -accelerationMultiplier;
  else keypressAccelX *= 0;
  if (keypress.y === 'DOWN') keypressAccelY *= accelerationMultiplier;
  else if (keypress.y === 'UP') keypressAccelY *= -accelerationMultiplier;
  else keypressAccelY *= 0;

  const netAccelX = keypressAccelX + dampingDecelX;
  const netAccelY = keypressAccelY + dampingDecelY;

  return {
    xp: nextPosition(xp, vxp, netAccelX, timeStep),
    yp: nextPosition(yp, vyp, netAccelY, timeStep),
    // bound velocity by [-maxSpeed, maxSpeed]
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


/**
 * @param {number} pos - starting position in one coordinate
 * @param {number} vel - starting velocity in one direction
 * @param {number} target - target position, in one coordinate
 * @param {number} time - the number of seconds it should take to reach target
 * @param {number} threshold - the largest possible absolute difference between the return value and
 *   the true correct acceleration (default to 0.01)
 * @returns {number} how often (from -1.0-1.0) we should hold the arrow key in the direction of the
 *   target (negative numbers mean we should brake)
 */
export function binarySearchAcceleration(pos, vel, target, time, threshold = 0.01) {
  let lo = -1.0;
  let hi = 1.0;
  const step = 0.01;
  while (hi - lo > threshold) {
    const mid = (hi + lo) / 2;
    // console.log(`Trying acceleration: ${mid}`);
    let t = 0;
    let position = pos;
    let speed = vel;
    while (t < time) {
      const nextState = projectedState(position, 0, speed, 0, { x: 'RIGHT' }, step, mid);
      position = nextState.xp;
      speed = nextState.vxp;
      t += step;
    }
    if (position > target) { // overshot the target
      hi = mid;
    } else { // undershot the target
      lo = mid;
    }
  }
  return (hi + lo) / 2;
}

/**
 * @param {number} x - starting position (pixels)
 * @param {number} y - starting y position (pixels)
 * @param {number} vx - starting velocity x (pixels)
 * @param {number} vy - starting velocity y (pixels)
 * @param {number} destX - target x (pixels)
 * @param {number} destY - target y (pixels)
 * @returns {{accX: number, accY: number}} The desired acceleration multipliers to reach the
 *   destination. The positive directions are down and right.
 */
export function desiredAccelerationMultiplier(x, y, vx, vy, destX, destY) {
  const flipX = x > destX;
  const flipY = y > destY;
  const step = 0.01; // simulation timestep
  /* eslint-disable no-param-reassign */
  // put the target down and to the right of the current location
  // this makes the loop control easier because we know to hold DOWN and RIGHT
  if (flipX) {
    const temp = x;
    x = destX;
    destX = temp;
    vx = -vx;
  }
  if (flipY) {
    const temp = y;
    y = destY;
    destY = temp;
    vy = -vy;
  }
  /* eslint-enable no-param-reassign */
  let currX = x;
  let currY = y;
  let currVx = vx;
  let currVy = vy;
  let currTime = 0;
  // simulate until we've overshot both directions
  while (currX <= destX || currY <= destY) {
    const nextState = projectedState(currX, currY, currVx, currVy, { y: 'DOWN', x: 'RIGHT' }, step);
    currX = nextState.xp;
    currY = nextState.yp;
    currVx = nextState.vxp;
    currVy = nextState.vyp;
    currTime += step;
  }

  const overshotX = (currX - destX) > (currY - destY);
  const overshotY = (currX - destX) < (currY - destY);
  const res = { accX: 1.0, accY: 1.0 };
  // binary search for the acceleration in the direction we reach more quickly in simulation
  if (overshotX) res.accX = binarySearchAcceleration(x, vx, destX, currTime);
  if (overshotY) res.accY = binarySearchAcceleration(y, vy, destY, currTime);
  // undo the flips we did at the start
  if (flipX) res.accX *= -1;
  if (flipY) res.accY *= -1;

  return res;
}

