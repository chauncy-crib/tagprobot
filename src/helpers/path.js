import { astar, Graph } from 'javascript-astar';
import { assert, assertGridInBounds } from '../../src/utils/asserts';

/*
 * takes in current location and target location (eg, the location of the flag) and the map
 * represented as a grid of 1 and 0, where 1s are traversable and 0s are not. Uses A* to calculate
 * the best path
 *
 * @param {Object} me - object with bot's position in cells, xc and yc
 * @param {Object} target - object with target's position in cells, xc and yc
 * @param {number} grid - 2D array of cells. Traversable cells are 1s, others are 0.
 */
export function getShortestPath(me, target, grid, diagonal = false) {
  // TODO: handle edge cases regarding target and current position
  // diagonal is true if we consider diagonal steps on the grid

  assertGridInBounds(grid, me.xc, me.yc);
  assertGridInBounds(grid, target.xc, target.yc);

  const graph = new Graph(grid, { diagonal });
  const start = graph.grid[me.xc][me.yc];
  const end = graph.grid[target.xc][target.yc];
  // calculate shortest path list
  const shortestPath = astar.search(graph, start, end,
    { heuristic: diagonal ? astar.heuristics.diagonal : astar.heuristics.manhattan });

  if (shortestPath.length === 0) {
    return undefined;
  }
  return shortestPath;
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
  assert(shortestPath, 'shortestPath is undefined, there may be no traversable path to the target');
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
