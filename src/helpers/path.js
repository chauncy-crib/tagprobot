/**
 * Our A-star implementation is based on the pseudocode from this website:
 * http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
 */
import _ from 'lodash';
import FibonacciHeap from '@tyriar/fibonacci-heap';
import { assert, assertGridInBounds } from '../../src/utils/asserts';
import { DIAGONAL } from '../constants';


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

export class PathState extends State {
  constructor(xc, yc) {
    super();
    this.xc = xc;
    this.yc = yc;
    this.key = `${xc},${yc}`;
  }

  /**
   * @param {GameState} targetState - the GameState object we are calculating the heuristic distance
   *   to
   * @returns {number} the heuristic distance from this state to the targetState
   */
  heuristic(targetState) {
    const xDiff = Math.abs(this.xc - targetState.xc);
    const yDiff = Math.abs(this.yc - targetState.yc);
    if (DIAGONAL) {
      const diagDist = Math.sqrt(2) * Math.min(xDiff, yDiff);
      const linDist = Math.abs(xDiff - yDiff);
      return diagDist + linDist;
    }
    return xDiff + yDiff;
  }

  equals(state) {
    return this.xc === state.xc && this.yc === state.yc;
  }

  /**
   * @param {number[][]} traversabilityCells - 2d grid of cell traversabilities, 1 for traversable,
   *   0 for NT
   * @returns {GameState[]} an array of neighboring GameStates, with g values initialized to current
   *   node's g value + 1
   */
  neighbors(traversabilityCells) {
    // Vertical and horizontal neighbors
    let potentialNeighbors = [
      new PathState(this.xc - 1, this.yc),
      new PathState(this.xc + 1, this.yc),
      new PathState(this.xc, this.yc - 1),
      new PathState(this.xc, this.yc + 1),
    ];
    // Diagonal neighbors
    if (DIAGONAL) {
      potentialNeighbors = potentialNeighbors.concat([
        new PathState(this.xc - 1, this.yc - 1),
        new PathState(this.xc - 1, this.yc + 1),
        new PathState(this.xc + 1, this.yc - 1),
        new PathState(this.xc + 1, this.yc + 1),
      ]);
    }
    // Assign g values of neighbors
    _.forEach(potentialNeighbors, n => {
      n.g = this.g + 1;
      n.parent = this;
    });
    // Filter out out of bounds and NT neighbors
    return _.filter(potentialNeighbors, n => {
      if (
        n.xc < 0
        || n.yc < 0
        || n.xc >= traversabilityCells.length
        || n.yc >= traversabilityCells[0].length
      ) {
        return false;
      }
      return traversabilityCells[n.xc][n.yc];
    });
  }
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


/**
 * Takes in current location and target location (eg, the location of the flag) and the map
 *   represented as a grid of 1 and 0, where 1s are traversable and 0s are not. Uses A* to calculate
 *   the best path
 * @param {Object} me - object with bot's position in cells, xc and yc
 * @param {Object} target - object with target's position in cells, xc and yc
 * @param {number} traversabilityCells - 2D array of cells. Traversable cells are 1s, others are 0.
 * @returns {PathState[]} a list of states, starting from the startState to the targetState
 */
export function getShortestCellPath(me, target, traversabilityCells) {
  assert(_.has(me, 'xc'));
  assert(_.has(me, 'yc'));
  assert(_.has(target, 'xc'));
  assert(_.has(target, 'yc'));

  assertGridInBounds(traversabilityCells, me.xc, me.yc);
  assertGridInBounds(traversabilityCells, target.xc, target.yc);

  const startState = new PathState(me.xc, me.yc);
  const targetState = new PathState(target.xc, target.yc);

  return runAstar(startState, targetState, traversabilityCells);
}

