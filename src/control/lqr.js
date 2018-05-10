import _ from 'lodash';
import math from 'mathjs';

import { assert, boundValue } from '../global/utils';
import { getPlayerCenter } from '../look/playerLocations';
import { Point } from '../interpret/class/Point';
import { FPS, ACCEL, MAX_SPEED, DAMPING_FACTOR } from './constants';
import { Matrix } from './class/Matrix';


let currentGoalState;
let currentKs;
let currentTime;
let currentDeadline;


/**
 * @param {PolypointState[]} path - a list of states returned by getShortestPolypointPath()
 * @param {{x: number, y: number}} me - the object from tagpro.players, storing x and y pixel
 *   locations
 * @returns {{x: number, y: number, vx: number, vy: number}} the next goal state for our local
 *   controller
 */
export function getLocalGoalStateFromPath(path, me) {
  if (_.isNull(path)) {
    console.warn('Shortest path was null, using own location and zero velocity as localGoalState');
    const myCenter = getPlayerCenter(me);
    return { x: myCenter.x, y: myCenter.y, vx: 0, vy: 0 };
  }
  const pathLength = path.length;
  assert(pathLength > 1, `Shortest path was length ${pathLength}`);
  if (pathLength === 2) {
    const finalNode = path[1].point;
    return { x: finalNode.x, y: finalNode.y, vx: 0, vy: 0 };
  }
  const nextNode = path[1].point;
  const nextNextNode = path[2].point;
  // Max velocity from nextNode to nextNextNode
  const maxVel = nextNextNode.subtract(nextNode).scaleToMax(MAX_SPEED);
  return { x: nextNode.x, y: nextNode.y, vx: maxVel.x, vy: maxVel.y };
}


/*
 * Run discrete linear quadratic regulator on the inputs to determine optimal K matrix for
 *   different deadlines from 0 to currentDeadline
 * @param {Matrix} A - state difference equations
 * @param {Matrix} B - Matrix to apply control signal to the state
 * @param {Matrix} Q - intermediate state cost
 * @param {Matrix} F - terminal state cost
 * @param {Matrix} R - control cost
 * @param {Matrix} goal - goal state vector
 * @returns {Matrix} an array of K matrices to generate optimal control signal at each time step
 */
export function dlqr(A, B, Q, F, R, goal) {
  // Prepare each Matrix with extra rows and columns to account for non-zero goal velocity
  A.append(A.dot(goal).subtract(goal), 1);
  const lastRow = new Matrix(math.zeros([1, A.shape()[0]]));
  lastRow.append([[1]], 1);
  A.append(lastRow);

  B.append([[0, 0]]);

  Q.append(math.zeros([Q.shape()[0], 1]), 1);
  Q.append(math.zeros([1, Q.shape()[1]]));

  F.append(math.zeros([F.shape()[0], 1]), 1);
  F.append(math.zeros([1, F.shape()[1]]));

  // Cost at each time step
  const Ps = new Matrix(math.zeros([currentDeadline, Q.shape()[0], Q.shape()[1]]));
  Ps.set(Ps.shape()[0] - 1, F);

  const Ks = new Matrix(math.zeros([currentDeadline - 1, R.shape()[0], A.shape()[1]]));

  _.forEach(_.range(currentDeadline - 2, 0, -1), t => {
    const nextCost = Ps.get(t + 1);
    const cost =
      (A
        .transpose()
        .dot(nextCost)
        .dot(A)
      )
        .subtract((A
          .transpose()
          .dot(nextCost)
          .dot(B)
          .dot((R
            .add((B
              .transpose()
              .dot(nextCost)
              .dot(B)
            ))
            .inverse()
          ))
          .dot((B
            .transpose()
            .dot(nextCost)
            .dot(A)
          ))
        ))
        .add(Q);
    Ps.set(t, cost);

    const K = R
      .add(B.transpose().dot(cost).dot(B))
      .inverse()
      .dot(B.transpose().dot(cost).dot(A));
    Ks.set(t, K);
  });

  return Ks;
}


/**
 * @param {Matrix} goalState - state in the format [[x], [vx], [y], [vy]]
 */
function recalculateKMatrices(goalState) {
  const b = DAMPING_FACTOR;
  const dt = 1 / FPS;

  // Difference equations
  const A = new Matrix([
    [1, dt, 0, 0], // x = x + (dx/dt * dt)
    [0, 1 + (-b * dt), 0, 0], // dx/dt = dx/dt + (dx/dt * (-b * dt))
    [0, 0, 1, dt], // y = y + (dy/dt * dt)
    [0, 0, 0, 1 + (-b * dt)], // dy/dt = dy/dt + (dy/dt * (-b * dt))
  ]);

  // Matrix to apply our control signal to our state
  const B = new Matrix([
    [0, 0],
    [dt, 0],
    [0, 0],
    [0, dt],
  ]);

  const Q = new Matrix(math.diag([0, 0, 0, 0])); // intermediate state cost
  const F = new Matrix(math.diag([1000, 1000, 1000, 1000])); // terminal state cost
  const R = new Matrix(math.diag([1, 1])); // control cost

  currentKs = dlqr(A, B, Q, F, R, goalState);
  currentTime = 1;
  currentGoalState = goalState;
}


/**
 * @param {{x: number, y: number, vx: number, vy: number}} initialState
 * @param {{x: number, y: number, vx: number, vy: number}} goalState
 * @returns {number} the best guess for the number of seconds it will take to reach the goal state
 */
export function determineDeadline(initialState, goalState) {
  const initialPoint = new Point(initialState.x, initialState.y);
  const goalPoint = new Point(goalState.x, goalState.y);
  const initialVelocity = new Point(initialState.vx, initialState.vy);
  const goalVelocity = new Point(goalState.vx, goalState.vy);

  const distance = initialPoint.distance(goalPoint);
  // const averageVelocity = (initialVelocity.magnitude() + goalVelocity.magnitude()) / 2;
  // let seconds = distance / averageVelocity;
  let seconds = (distance / MAX_SPEED) +
    (goalVelocity.subtract(initialVelocity).magnitude() / ACCEL);
  if (seconds > 5) seconds = 5; // cap at 5 seconds for dlqr performance
  currentDeadline = Math.floor(FPS * seconds);
}


/**
 * @param {{x: number, y: number, vx: number, vy: number}} initialState
 * @param {{x: number, y: number, vx: number, vy: number}} goalState
 * @returns {{accX: number, accY: number}} The desired acceleration multipliers to reach the
 *   destination. The positive directions are down and right.
 */
export function getLQRAccelerationMultipliers(initialState, goalState) {
  const iStateMatrix = new Matrix([
    [initialState.x],
    [initialState.vx],
    [initialState.y],
    [initialState.vy],
  ]);
  const gStateMatrix = new Matrix([
    [goalState.x],
    [goalState.vx],
    [goalState.y],
    [goalState.vy],
  ]);

  if (!gStateMatrix.equals(currentGoalState) || currentTime >= currentDeadline - 1) {
    // There is a new goal state or we've exceeded our deadline
    determineDeadline(initialState, goalState);
    recalculateKMatrices(gStateMatrix);
  }

  const x = iStateMatrix.subtract(gStateMatrix);
  x.append([[1]]);
  const u = currentKs.get(currentTime).scalarMultiply(-1).dot(x); // [[ax], [ay]]
  currentTime += 1;

  // Max acceleration at 1 or -1
  return {
    accX: boundValue(u.array[0][0] / ACCEL, -1, 1),
    accY: boundValue(u.array[1][0] / ACCEL, -1, 1),
  };
}
