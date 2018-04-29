import _ from 'lodash';
import math from 'mathjs';

import { Matrix } from './class/Matrix';
import { FPS, ACCEL, DAMPING_FACTOR } from './constants';
import { boundValue } from '../global/utils';

let currentGoalState;
let currentKs;
let currentTime;


/*
 * Run discrete linear quadratic regulator on the inputs to determine optimal K matrix for
 *   different deadlines from 0 to T
 * @param {Matrix} A - state difference equations
 * @param {Matrix} B - Matrix to apply control signal to the state
 * @param {Matrix} Q - intermediate state cost
 * @param {Matrix} F - terminal state cost
 * @param {Matrix} R - control cost
 * @param {Matrix} goal - goal state vector
 * @param {number} T - number of time steps
 * @returns {Matrix} an array of K matrices to generate optimal control signal at each time step
 */
export function dlqr(A, B, Q, F, R, goal, T) {
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
  const Ps = new Matrix(math.zeros([T, Q.shape()[0], Q.shape()[1]]));
  Ps.set(Ps.array.length - 1, F);

  const Ks = new Matrix(math.zeros([T - 1, R.shape()[0], A.shape()[1]]));

  _.forEach(_.range(T - 2, 0, -1), t => {
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
 * @param {number} T - number of time steps to reach the goal
 */
function recalculateKMatrices(goalState, T) {
  const b = DAMPING_FACTOR;
  const dt = 1 / FPS;

  // Difference equations
  const A = new Matrix([
    [1, dt, 0, 0], // x = x + (dx/dt * dt)
    [0, 1 - (b * dt), 0, 0], // dx/dt = dx/dt + (dx/dt * (-b * dt))
    [0, 0, 1, dt], // y = y + (dy/dt * dt)
    [0, 0, 0, 1 - (b * dt)], // dy/dt = dx/dt + (dy/dt * (-b * dt))
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

  currentKs = dlqr(A, B, Q, F, R, goalState, T);
  currentTime = 1;
  currentGoalState = goalState;
}


/**
 * @param {Matrix} initialState - state in the format [[x], [vx], [y], [vy]]
 * @param {Matrix} goalState - state in the format [[x], [vx], [y], [vy]]
 * @param {number} totalTime - seconds the bot will take to get to the goal
 * @returns {{accX: number, accY: number}} The desired acceleration multipliers to reach the
 *   destination. The positive directions are down and right.
 */
export function getLQRAccelerationMultipliers(initialState, goalState, totalTime) {
  const T = Math.floor(FPS * totalTime); // number of time steps

  if (!goalState.equals(currentGoalState) || currentTime >= T - 1) {
    // There is a new goal state or we've exceeded our goal time
    recalculateKMatrices(goalState, T);
  }

  const x = initialState.subtract(goalState);
  x.append([[1]]);
  const u = currentKs.get(currentTime).scalarMultiply(-1).dot(x); // [[ax], [ay]]
  currentTime += 1;

  // Max acceleration at 1 or -1
  return {
    accX: boundValue(u.array[0][0] / ACCEL, -1, 1),
    accY: boundValue(u.array[1][0] / ACCEL, -1, 1),
  };
}
