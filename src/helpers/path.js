/*
 * Our A-star implementation is based on the pseudocode from this website:
 * http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
 */
import _ from 'lodash';
import FibonacciHeap from '@tyriar/fibonacci-heap';
import { assert, assertGridInBounds } from '../../src/utils/asserts';


const diagonal = false;

export class GameState {
  constructor(xc, yc) {
    this.xc = xc;
    this.yc = yc;

    this.g = undefined; // the cost to the current state

    // the estimated total cost from the start state to the target state,
    // passing through this state.
    this.f = undefined;

    // the GameState we came from
    this.parent = undefined;
  }

  key() {
    return [this.xc, this.yc].join(',');
  }

  /*
   * @param {GameState} targetState - the GameState object we are calculating the heuristic distance
   *   to
   * @return - the heuristic distance from this state to the targetState
   */
  heuristic(targetState) {
    const xdiff = Math.abs(this.xc - targetState.xc);
    const ydiff = Math.abs(this.yc - targetState.yc);
    if (diagonal) {
      return Math.max(xdiff, ydiff);
    }
    return xdiff + ydiff;
  }

  equals(state) {
    return this.xc === state.xc && this.yc === state.yc;
  }

  /*
   * @param traversabilityCells - 2d grid of cell traversabilities, 1 for traversable, 0 for NT
   * @return {Array} - Array of neighboring GameStates, with g values initialized to current node's
   *   g value + 1
   */
  neighbors(traversabilityCells) {
    // vertical and horizontal neighbors
    let potentialNeighbors = [
      new GameState(this.xc - 1, this.yc),
      new GameState(this.xc + 1, this.yc),
      new GameState(this.xc, this.yc - 1),
      new GameState(this.xc, this.yc + 1),
    ];
    // diagonal neighbors
    if (diagonal) {
      potentialNeighbors = potentialNeighbors.concat([
        new GameState(this.xc - 1, this.yc - 1),
        new GameState(this.xc - 1, this.yc + 1),
        new GameState(this.xc + 1, this.yc - 1),
        new GameState(this.xc + 1, this.yc + 1),
      ]);
    }
    // assign g values of neighbors
    _.each(potentialNeighbors, n => {
      n.g = this.g + 1; // eslint-disable-line no-param-reassign
      n.parent = this; // eslint-disable-line no-param-reassign
    });
    // filter out out of bounds and NT neighbors
    return _.filter(potentialNeighbors, n => {
      if (n.xc < 0
        || n.yc < 0
        || n.xc >= traversabilityCells.length
        || n.yc >= traversabilityCells[0].length) {
        return false;
      }
      return traversabilityCells[n.xc][n.yc];
    });
  }
}

/*
 * @param {GameState} finalState
 * @returns {Array} list of GameStates from starting state to final state, not including the
 *   starting state.
 */
function constructPath(finalState) {
  const path = [];
  let state = finalState;
  while (state.parent) {
    path.push(state);
    state = state.parent;
  }
  path.reverse();
  return path;
}


/*
 * takes in current location and target location (eg, the location of the flag) and the map
 * represented as a grid of 1 and 0, where 1s are traversable and 0s are not. Uses A* to calculate
 * the best path
 *
 * @param {Object} me - object with bot's position in cells, xc and yc
 * @param {Object} target - object with target's position in cells, xc and yc
 * @param {number} traversabilityCells - 2D array of cells. Traversable cells are 1s, others are 0.
 */
export function getShortestPath(me, target, traversabilityCells) {
  assert(_.has(me, 'xc'));
  assert(_.has(me, 'yc'));
  assert(_.has(target, 'xc'));
  assert(_.has(target, 'yc'));

  assertGridInBounds(traversabilityCells, me.xc, me.yc);
  assertGridInBounds(traversabilityCells, target.xc, target.yc);

  const startState = new GameState(me.xc, me.yc);
  const targetState = new GameState(target.xc, target.yc);

  // keep track of potential game states in a fibonacci heap, where the key is the f-cost for the
  // state, and value is the GameState object
  const fibHeap = new FibonacciHeap();
  // keep a Map from GameState key to GameState object stored in the Fibonacci Heap
  const openList = new Map();
  // keep a list of the GameState keys of closed states
  const closedList = new Set();

  // start with the current state in the fibonacci heap
  startState.g = 0;
  startState.f = startState.g + startState.heuristic(targetState);
  fibHeap.insert(startState.f, startState);

  while (!fibHeap.isEmpty()) {
    // get the state with the lowest f-cost
    const currState = fibHeap.extractMinimum().value; // key is f-cost, value is state
    if (targetState.equals(currState)) { // we found the target
      return constructPath(currState);
    }
    // move current state from openList to closedList
    openList.delete(currState.key());
    closedList.add(currState.key());
    // iterate over neighbors
    _.each(currState.neighbors(traversabilityCells), neighbor => {
      // if the neighbor has been closed, don't add it to the fib heap
      if (closedList.has(neighbor.key())) {
        return;
      }
      // assign neighbor's f-cost
      // eslint-disable-next-line no-param-reassign
      neighbor.f = neighbor.g + neighbor.heuristic(targetState);
      // if neighbor not in openList, add it
      if (!openList.has(neighbor.key())) {
        const neighborNode = fibHeap.insert(neighbor.f, neighbor);
        openList.set(neighbor.key(), neighborNode);
      // else, if we've found a faster route to the neighbor, update the f-cost in openList
      } else {
        const openNeighbor = openList.get(neighbor.key());
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


/*
 * Takes in the current player's location, and a representation of the shortest
 * path as an array of cells returned by getShortestPath(), and returns the
 * position (in cells) that the player should seek toward.
 *
 * @param {Object} me - object with bot's position in cells, xc and yc
 * @return {Object} - object with target's position in cells, xc and yc
 */
export function getTarget(me, shortestPath) {
  assert(shortestPath, 'shortestPath is null, there may be no traversable path to the target');
  // Find the furthest cell in the direction of the next cell
  let winner = 0;
  let j = 0;
  if (shortestPath.length > 1) {
    const diff = {
      xc: shortestPath[0].xc - me.xc,
      yc: shortestPath[0].yc - me.yc,
    };
    const nDiff = {};
    for (let i = 0; i < shortestPath.length; i++) {
      nDiff.xc = shortestPath[i].xc - me.xc;
      if (diff.xc === nDiff.xc) {
        winner += 1;
      } else {
        break;
      }
    }
    for (; j < winner; j++) {
      nDiff.yc = shortestPath[j].yc - me.yc;
      if (diff.yc !== nDiff.yc) {
        winner = j;
        break;
      }
    }
  }
  const next = shortestPath[j];
  return { xc: next.xc, yc: next.yc };
}
