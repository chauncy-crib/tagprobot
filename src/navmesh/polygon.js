import _ from 'lodash';
import { Graph, Point } from './graph';
import { getTileProperty } from '../tiles';
import { PPTL } from '../../src/constants';

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
 * output (with returned tiles represneted as 1s)
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

export function polygonsFromTagproMap(map) {
  const edgeTiles = mapToEdgeTiles(map);
  const graph = new Graph();
  _.each(edgeTiles, tile => {
    const { x, y } = tile;
    const xp = x * PPTL;
    const yp = y * PPTL;
    if (x === 0 || !getTileProperty(map[x - 1][y], 'traversable')) {
      // point on top-left
      const p1 = new Point(xp, yp);
      // point on bottom-left
      const p2 = new Point(xp, yp + PPTL);
      graph.addVertex(p1);
      graph.addVertex(p2);
      graph.addEdge(p1, p2);
    } else if (x === map.length - 1 || !getTileProperty(map[x + 1][y], 'traversable')) {
      // point on top-right
      const p1 = new Point(xp + PPTL, yp);
      // point on bottom-right
      const p2 = new Point(xp + PPTL, yp + PPTL);
      graph.addVertex(p1);
      graph.addVertex(p2);
      graph.addEdge(p1, p2);
    } else if (y === 0 || !getTileProperty(map[x][y - 1], 'traversable')) {
      // point on top-left
      const p1 = new Point(xp, yp);
      // point on top-right
      const p2 = new Point(xp + PPTL, yp);
      graph.addVertex(p1);
      graph.addVertex(p2);
      graph.addEdge(p1, p2);
      // add line above
    } else if (y === map[0].length - 1 || !getTileProperty(map[x][y + 1], 'traversable')) {
      // point on bottom-left
      const p1 = new Point(xp, yp + PPTL);
      // point on bottom-right
      const p2 = new Point(xp + PPTL, yp + PPTL);
      graph.addVertex(p1);
      graph.addVertex(p2);
      graph.addEdge(p1, p2);
    }
  });
  return graph;
}
