/*
 * Our A-star implementation is based on the pseudocode from this website:
 * http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
 */
import _ from 'lodash';
import FibonacciHeap from '@tyriar/fibonacci-heap';
import { assert, assertGridInBounds } from '../utils/asserts';
import { accelTilesPerSecond, tilesPerMeter, PPTL, timeStep, PPCL, directions } from '../constants';
import { getMe } from '../helpers/player';


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
      return (1.4142 * Math.min(xdiff, ydiff)) + Math.abs(xdiff - ydiff);
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
    _.each(potentialNeighbors, n => {
      n.g = this.g + 1; // eslint-disable-line no-param-reassign
      n.parent = this; // eslint-disable-line no-param-reassign
    });
    // diagonal neighbors
    if (diagonal) {
      const diagNeighbors = [
        new GameState(this.xc - 1, this.yc - 1),
        new GameState(this.xc - 1, this.yc + 1),
        new GameState(this.xc + 1, this.yc - 1),
        new GameState(this.xc + 1, this.yc + 1),
      ];
      _.each(diagNeighbors, n => {
        // use sqrt(2) as heuristic distance for diagonals
        n.g = this.g + 1.4142; // eslint-disable-line no-param-reassign
        n.parent = this; // eslint-disable-line no-param-reassign
      });
      potentialNeighbors = potentialNeighbors.concat(diagNeighbors);
    }
    // assign g values of neighbors
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
 * Uses the physics kinematics equations to calculate a projected x and y location.
 * The numerator of all units should be equivalent (use pixels, pixels/sec, and pixels/sec^2 for
 * example). The unit for tStep should be the denominator on the `v` and `a` inputs.
 */
export function projectedLocation(x, y, vx, vy, ax, ay, tStep) {
  return {
    x: x + (vx * tStep) + (0.5 * ax * (tStep ** 2)),
    y: y + (vy * tStep) + (0.5 * ay * (tStep ** 2)),
  };
}


/*
 * @param {GameState} finalState - the final target GameState object. Will use to construct the path
 *   by walking the parent pointers back to the start state. 
 * @return {Array} list of GameStates from starting state to final state, not including the
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
 * @param {number} myxc - the current bot x location in cells
 * @param {number} myyc - the current bot y location in cells
 * @param {Object} target - object with target's position in cells, xc and yc
 * @param {number} traversabilityCells - 2D array of cells. Traversable cells are 1s, others are 0.
 */
export function getShortestPath(myxc, myyc, target, traversabilityCells) {
  assert(_.has(target, 'xc'));
  assert(_.has(target, 'yc'));

  assertGridInBounds(traversabilityCells, myxc, myyc);
  assertGridInBounds(traversabilityCells, target.xc, target.yc);

  const startState = new GameState(myxc, myyc);
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
 * @param {number} traversabilityCells - 2D array of cells. Traversable cells are 1s, others are 0.
 * @param {Object} target - object with target's position in cells, xc and yc
 * @return {{direction: number, path: Array}} an object containing both which keypress we should
 *   hold and the path we are seeking toward
 */
export function getBestKeyPress(traversabilityCells, target) {
  const me = getMe();
  // my x and y in pixels
  const myxp = me.x + (PPTL / 2);
  const myyp = me.y + (PPTL / 2);
  // my vx and vy in pixels
  const myvxp = me.vx * tilesPerMeter; // me.vx is in meters/second
  const myvyp = me.vy * tilesPerMeter;
  let bestDirection;
  let smallestDistance = Infinity;
  let bestPath;
  for (let i = 0; i < directions.length; i++) {
    const loc = projectedLocation(
      myxp, myyp, myvxp, myvyp,
      // the accelerations from this keypress, in pixels per second
      directions[i].x * accelTilesPerSecond * PPTL,
      directions[i].y * accelTilesPerSecond * PPTL,
      timeStep,
    );
    // calculate the length of the path from our projected location
    // to the target
    const path = getShortestPath(
      Math.floor(loc.x / PPCL),
      Math.floor(loc.y / PPCL),
      target,
      traversabilityCells);
    // if this path exists and is shorter than a path we've found previously, store this keypress as
    // the best one so far
    if (path && path.length < smallestDistance) {
      smallestDistance = path.length;
      bestDirection = i;
      bestPath = path;
    }
  }
  return { direction: bestDirection, path: bestPath };
}
