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
    return [this.xc, this.yc];
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

export function shortestPath(me, target, traversabilityCells) {
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
  const openListMap = new Map();
  // keep a list of the GameState keys of closed states
  const closedList = new Set();

  // start with the current state in the fibonacci heap
  startState.g = 0;
  startState.f = startState.g + startState.heuristic(targetState);
  fibHeap.insert(startState.f, startState);

  while (!fibHeap.isEmpty()) {
    const node = fibHeap.extractMinimum();
    const state = node.value;
    openListMap.delete(state.key());
    if (targetState.equals(state)) {
      let curr = state;
      while (curr) {
        console.log(curr.xc, curr.yc);
        curr = curr.parent;
      }
      console.log('FOUND');
      break;
    }
    closedList.add(state.key());
    _.each(state.neighbors(traversabilityCells), neighbor => {
      if (!closedList.has(neighbor.key())) {
        // eslint-disable-next-line no-param-reassign
        neighbor.f = neighbor.g + neighbor.heuristic(targetState);
        if (!openListMap.has(neighbor.key())) {
          const neighborNode = fibHeap.insert(neighbor.f, neighbor);
          openListMap.set(neighbor.key(), neighborNode);
        } else {
          const openNeighbor = openListMap.get(neighbor.key());
          const openNeighborState = openNeighbor.value;
          if (neighbor.g < openNeighborState.g) {
            openNeighborState.g = neighbor.g;
            openNeighborState.f = neighbor.f;
            openNeighborState.parent = state;
            // TODO: handle parent
            fibHeap.decreaseKey(openNeighbor, openNeighborState.f);
          }
        }
      }
    });
  }
}
