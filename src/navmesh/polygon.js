import _ from 'lodash';
import { Graph, Point } from './graph';
import { getTileProperty, tileIsOneOf } from '../tiles';
import { PPTL } from '../../src/constants';

function threePointsInLine(p1, p2, p3) {
  const x1 = p2.x - p1.x;
  const x2 = p2.x - p3.x;
  const y1 = p2.y - p1.y;
  const y2 = p2.y - p3.y;
  if (x1 === 0 || x2 === 0) {
    return x1 === x2;
  }
  // use line slopes to calculate if all three points are in a line
  return y1 * x2 === y2 * x1;
}


function wallOnLeft(map, x, y) {
  if (x === 0) {
    return true;
  }
  const id = map[x - 1][y];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_2'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


function wallOnRight(map, x, y) {
  if (x === map.length - 1) {
    return true;
  }
  const id = map[x + 1][y];
  if (tileIsOneOf(id, ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


function wallOnTop(map, x, y) {
  if (y === 0) {
    return true;
  }
  const id = map[x][y - 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


function wallOnBottom(map, x, y) {
  if (y === map[0].length - 1) {
    return true;
  }
  const id = map[x][y + 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
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
      // angle walls have a traversability edge
      if (tileIsOneOf(
        map[x][y],
        ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
      )) {
        res.push({ x, y });
        continue; // eslint-disable-line no-continue
      }
      if (
        // only store edges of traversable tiles
        getTileProperty(map[x][y], 'traversable') && (
          wallOnLeft(map, x, y) ||
          wallOnRight(map, x, y) ||
          wallOnTop(map, x, y) ||
          wallOnBottom(map, x, y)
        )
      ) {
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
    if (tileIsOneOf(map[x][y], ['ANGLE_WALL_1', 'ANGLE_WALL_3'])) {
      graph.addVertex(topLeft);
      graph.addVertex(bottomRight);
      graph.addEdge(topLeft, bottomLeft);
    } else if (tileIsOneOf(map[x][y], ['ANGLE_WALL_2', 'ANGLE_WALL_4'])) {
      graph.addVertex(bottomLeft);
      graph.addVertex(topRight);
      graph.addEdge(bottomLeft, topRight);
    }
    if (wallOnLeft(map, x, y) && !tileIsOneOf(map[x][y], ['ANGLE_WALL_1', 'ANGLE_WALL_2'])) {
      // edge on left
      graph.addVertex(topLeft);
      graph.addVertex(bottomLeft);
      graph.addEdge(topLeft, bottomLeft);
    } if (wallOnRight(map, x, y) && !tileIsOneOf(map[x][y], ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) {
      // edge on right
      graph.addVertex(topRight);
      graph.addVertex(bottomRight);
      graph.addEdge(topRight, bottomRight);
    } if (wallOnTop(map, x, y) && !tileIsOneOf(map[x][y], ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) {
      // edge above
      graph.addVertex(topLeft);
      graph.addVertex(topRight);
      graph.addEdge(topLeft, topRight);
    } if (wallOnBottom(map, x, y) && !tileIsOneOf(map[x][y], ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) {
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
  const vertices = unmergedGraph.getVertices();
  let i = 0;
  while (i < vertices.length) {
    const v = vertices[i];
    const neighbors = unmergedGraph.neighbors(v);
    if (neighbors.length === 2) {
      if (threePointsInLine(v, neighbors[0], neighbors[1])) {
        unmergedGraph.removeVertex(v);
        unmergedGraph.removeEdge(v, neighbors[0]);
        unmergedGraph.removeEdge(v, neighbors[1]);
        unmergedGraph.addEdge(neighbors[0], neighbors[1]);
      }
    }
    i += 1;
  }
  return unmergedGraph;
}
