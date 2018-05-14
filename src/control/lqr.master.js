import _ from 'lodash';
import work from 'webworkify-webpack';

import { Matrix } from './class/Matrix';
import { determineDeadline, getMultipliersFromKs } from './lqr';


const lqrWorker = work(require.resolve('./lqr.worker.js'));
let currentGoalState;
let currentKs;


lqrWorker.addEventListener('message', ev => {
  if (ev.data.text === 'DONE') {
    currentKs = (new Matrix()).fromObject(JSON.parse(ev.data.Ks));
  }
});


/**
 * @param {{x: number, y: number, vx: number, vy: number}} initialState
 * @param {{x: number, y: number, vx: number, vy: number}} goalState
 * @returns {{accX: number, accY: number}} The desired acceleration multipliers to reach the
 *   destination. The positive directions are down and right.
 */
export function getLQRAccelerationMultipliers(initialState, goalState) {
  const deadline = determineDeadline(initialState, goalState);

  if (!_.isEqual(goalState, currentGoalState)) {
    // There is a new goal state
    lqrWorker.postMessage({ text: 'RECALCULATE_K_MATRICES', goalState, deadline });
    currentGoalState = goalState;
  }

  // Calculated insufficient K matrices and should recalculate
  if (!currentKs || currentKs.shape()[0] <= 1) {
    lqrWorker.postMessage({ text: 'RECALCULATE_K_MATRICES', goalState, deadline });
    currentGoalState = goalState;
    return { accX: 0, accY: 0 };
  }

  return getMultipliersFromKs(initialState, goalState, currentKs, deadline);
}
