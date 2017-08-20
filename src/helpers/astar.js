import FibonacciHeap from '@tyriar/fibonacci-heap';
import _ from 'lodash';
import { assert, assertGridInBounds } from '../../src/utils/asserts';

const diagonal = true;

export class GameState {
  constructor(xc, yc) {
    this.xc = xc;
    this.yc = yc;
    // initialized for readability
    this.g = undefined;
    this.f = undefined;
    this.parent = undefined;
  }

  key() {
    return [this.xc, this.yc].join(',');
  }

  /*
   * @param {GameState} targetState - the GameState object we are calculating the heuristic distance
   *   to
   * @return the heuristic distance from this state to the targetState
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


function constructPath(finalState) {
  const path = [];
  let state = finalState;
  while (state.parent) {
    console.log(state.xc, state.yc);
    path.push(state);
    state = state.parent;
  }
  path.reverse();
  return path;
}

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
