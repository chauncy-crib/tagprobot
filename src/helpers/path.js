/**
 * Our A-star implementation is based on the pseudocode from this website:
 * http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
 */
import _ from 'lodash';
import FibonacciHeap from '@tyriar/fibonacci-heap';
import { assert } from '../../src/utils/asserts';


export class State {
  /* eslint-disable class-methods-use-this */
  constructor() {
    assert(new.target !== State, 'State object cannot be initialized directly');

    this.g = undefined; // the cost to the current state
    // The estimated total cost from the start state to the target state,
    // Passing through this state.
    this.f = undefined;
    // The GameState we came from
    this.parent = undefined;
  }

  heuristic() {
    assert(false, 'Method not implemented');
  }

  equals() {
    assert(false, 'Method not implemented');
  }

  neighbors() {
    assert(false, 'Method not implemented');
  }
  /* eslint-enable class-methods-use-this */
}


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
