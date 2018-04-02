import _ from 'lodash';
import FibonacciHeap from '@tyriar/fibonacci-heap';

import { assert } from '../global/utils';
import { Point } from '../interpret/class/Point';
import { Polypoint } from '../interpret/class/Polypoint';
import { PolypointState } from './class/PolypointState';


/**
 * @param {State} finalState - the final target State object. Will use to construct the path
 *   by walking the parent pointers back to the start state.
 * @returns {State[]} list of States from starting state to final state, including the
 *   starting state.
 */
function constructPath(finalState) {
  const path = [];
  let state = finalState;
  while (state) {
    path.push(state);
    state = state.parent;
  }
  path.reverse();
  return path;
}


/**
 * @param {State} startState
 * @param {State} targetState
 * @param {Object} neighborParam - the argument to pass the state.neighbors() function
 * @returns {State[]} a list of states, starting from the startState to the targetState
 */
export function runAstar(startState, targetState, neighborParam) {
  // Keep track of potential game states in a fibonacci heap, where the key is the f-cost for the
  // State, and value is the GameState object
  const fibHeap = new FibonacciHeap();
  // Keep a Map from GameState key to GameState object stored in the Fibonacci Heap
  const openList = new Map();
  // Keep a list of the GameState keys of closed states
  const closedList = new Set();

  // Start with the current state in the fibonacci heap
  startState.g = 0;
  startState.f = startState.g + startState.heuristic(targetState);
  fibHeap.insert(startState.f, startState);

  while (!fibHeap.isEmpty()) {
    // Get the state with the lowest f-cost
    const currState = fibHeap.extractMinimum().value; // key is f-cost, value is state
    if (targetState.equals(currState)) { // we found the target
      return constructPath(currState);
    }
    // Move current state from openList to closedList
    openList.delete(currState.key);
    closedList.add(currState.key);
    // Iterate over neighbors
    _.forEach(currState.neighbors(neighborParam), neighbor => {
      // If the neighbor has been closed, don't add it to the fib heap
      if (closedList.has(neighbor.key)) {
        return;
      }
      // Assign neighbor's f-cost
      neighbor.f = neighbor.g + neighbor.heuristic(targetState);
      if (!openList.has(neighbor.key)) { // if neighbor not in openList, add it
        const neighborNode = fibHeap.insert(neighbor.f, neighbor);
        openList.set(neighbor.key, neighborNode);
      } else { // else, if we've found a faster route to the neighbor, update the f-cost in openList
        const openNeighbor = openList.get(neighbor.key);
        const openNeighborState = openNeighbor.value;
        if (neighbor.g < openNeighborState.g) {
          openNeighborState.g = neighbor.g;
          openNeighborState.f = neighbor.f;
          openNeighborState.parent = currState;
          fibHeap.decreaseKey(openNeighbor, openNeighborState.f);
        }
      }
    });
  }
  return null;
}


/**
 * @param {Object} me - object with bot's position in pixels, xp and yp
 * @param {Object} target - object with target's position in pixels, xp and yp
 * @param {TriangleGraph} triangleGraph - the triangulation graph to run Astar through
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 */
export function getShortestPolypointPath(me, target, triangleGraph) {
  assert(_.has(me, 'xp'), 'me does not have xp');
  assert(_.has(me, 'yp'), 'me does not have yp');
  assert(_.has(target, 'xp'), 'target does not have xp');
  assert(_.has(target, 'yp'), 'target does not have yp');

  const startTriangle = triangleGraph.findContainingTriangles(new Point(me.xp, me.yp))[0];
  const endTriangle = triangleGraph.findContainingTriangles(new Point(target.xp, target.yp))[0];
  assert(startTriangle, 'Could not find triangle for starting point');
  assert(endTriangle, 'Could not find triangle for ending point');
  const startState = new PolypointState(startTriangle.getCenter());
  const targetState = new PolypointState(endTriangle.getCenter());
  const path = runAstar(startState, targetState, triangleGraph.polypoints);

  if (_.isNull(path)) return null; // if there was no path, return null

  // Place the starting and final locations on the path, and remove the polypoint in the triangle we
  //   are currently in
  const initialPositionState = new PolypointState(new Polypoint(me.xp, me.yp, startTriangle));
  const targetPositionState = new PolypointState(new Polypoint(target.xp, target.yp, endTriangle));
  const fullPath = [initialPositionState].concat(_.slice(path, 1, -1)).concat(targetPositionState);
  return fullPath;
}
