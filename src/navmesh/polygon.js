import _ from 'lodash';
import { Graph, Point } from './graph';
import { getTileProperty } from '../tiles';
import { PPTL } from '../../src/constants';

function threePointsInLine(p1, p2, p3) {
  if (p1.x === p2.x && p2.x === p3.x) {
    return true;
  }
  if (p1.y === p2.y && p2.y === p3.y) {
    return true;
  }
  return false;
}

/**
 * Get a list of tiles which are on the edge of the traversability space.
 *
 * input:
 *
 *   00000000000
 *   01001111110
 *   01101001110
 *   01101001110
 *   01101111110
 *   00000000000
 *
 * output (with returned tiles represented as 1s)
 *
 *   00000000000
 *   01001111110
 *   01101001010
 *   01101001010
 *   01101111110
 *   00000000000
 *
 * @param {{string|number}[][]} map
 * @returns {{x: number, y: number}[]}
 */
export function mapToEdgeTiles(map) {
  const res = [];
  for (let x = 0; x < map.length; x++) {
    for (let y = 0; y < map[0].length; y++) {
      // only store edges of traversable tiles
      if (!getTileProperty(map[x][y], 'traversable')) {
        continue; // eslint-disable-line no-continue
      }
      let edge = x === 0 || x === map.length - 1 || y === 0 || y === map[0].length;
      if (edge) {
        res.push({ x, y });
        continue; // eslint-disable-line no-continue
      }
      if (!getTileProperty(map[x - 1][y], 'traversable')) {
        // NT or edge on the left
        edge = true;
      } else if (!getTileProperty(map[x + 1][y], 'traversable')) {
        // NT or edge on the right
        edge = true;
      } else if (!getTileProperty(map[x][y - 1], 'traversable')) {
        // NT or edge above
        edge = true;
      } else if (!getTileProperty(map[x][y + 1], 'traversable')) {
        // NT or edge below
        edge = true;
      }
      if (edge) {
        res.push({ x, y });
      }
    }
  }
  return res;
}

export function unmergedGraphFromTagproMap(map) {
  const edgeTiles = mapToEdgeTiles(map);
  const graph = new Graph();
  _.each(edgeTiles, tile => {
    const { x, y } = tile;
    const xp = x * PPTL;
    const yp = y * PPTL;
    const topLeft = new Point(xp, yp);
    const topRight = new Point(xp + PPTL, yp);
    const bottomLeft = new Point(xp, yp + PPTL);
    const bottomRight = new Point(xp + PPTL, yp + PPTL);
    if (x === 0 || !getTileProperty(map[x - 1][y], 'traversable')) {
      // edge on left
      graph.addVertex(topLeft);
      graph.addVertex(bottomLeft);
      graph.addEdge(topLeft, bottomLeft);
    } if (x === map.length - 1 || !getTileProperty(map[x + 1][y], 'traversable')) {
      // edge on right
      graph.addVertex(topRight);
      graph.addVertex(bottomRight);
      graph.addEdge(topRight, bottomRight);
    } if (y === 0 || !getTileProperty(map[x][y - 1], 'traversable')) {
      // edge above
      graph.addVertex(topLeft);
      graph.addVertex(topRight);
      graph.addEdge(topLeft, topRight);
      // add line above
    } if (y === map[0].length - 1 || !getTileProperty(map[x][y + 1], 'traversable')) {
      // edge below
      graph.addVertex(bottomLeft);
      graph.addVertex(bottomRight);
      graph.addEdge(bottomLeft, bottomRight);
    }
  });

  return graph;
}


export function graphFromTagproMap(map) {
  const unmergedGraph = unmergedGraphFromTagproMap(map);
  let i = 0;
  while (i < unmergedGraph.vertices.length) {
    const v = unmergedGraph.vertices[i];
    const neighbors = unmergedGraph.neighbors(v);
    if (neighbors.length === 2) {
      if (threePointsInLine(v, neighbors[0], neighbors[1])) {
        unmergedGraph.removeVertex(v);
        unmergedGraph.removeEdge(v, neighbors[0]);
        unmergedGraph.removeEdge(v, neighbors[1]);
        unmergedGraph.addEdge(neighbors[0], neighbors[1]);
        i -= 1;
      }
    }
    i += 1;
  }
  return unmergedGraph;
}
