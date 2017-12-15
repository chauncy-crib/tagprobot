import _ from 'lodash';
import { Graph, Point } from './graph';
import { threePointsInLine } from './graphUtils';
import { getTileProperty, tileIsOneOf, tileHasName, tileIsAngleWall } from '../tiles';
import { PPTL } from '../constants';
import { assert } from '../utils/asserts';

// export function isLeftEdgeT(map, p) {
//   return gridInBounds(map, p.x, p.y) && (getTileProperty(map[p.x][p.y], 'traversable') ||
//     tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_3', 'ANGLE_WALL_4']));
// }


// export function isRightEdgeT(map, p) {
//   return gridInBounds(map, p.x, p.y) && (getTileProperty(map[p.x][p.y], 'traversable') ||
//     tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_1', 'ANGLE_WALL_2']));
// }


// export function isTopEdgeT(map, p) {
//   return gridInBounds(map, p.x, p.y) && (getTileProperty(map[p.x][p.y], 'traversable') ||
//     tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_1', 'ANGLE_WALL_4']));
// }


// export function isBottomEdgeT(map, p) {
//   return gridInBounds(map, p.x, p.y) && (getTileProperty(map[p.x][p.y], 'traversable') ||
//     tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_2', 'ANGLE_WALL_3']));
// }


function edgesInALine(e1, e2) {
  return threePointsInLine(e1.p1, e1.p2, e2.p1) && threePointsInLine(e1.p1, e1.p2, e2.p2);
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on the left.
 */
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


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on the right.
 */
function wallOnRight(map, xt, yt) {
  if (xt === map.length - 1) {
    return true;
  }
  const id = map[xt + 1][yt];
  if (tileIsOneOf(id, ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on top.
 */
function wallOnTop(map, xt, yt) {
  if (yt === 0) {
    return true;
  }
  const id = map[xt][yt - 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) below it.
 */
function wallOnBottom(map, xt, yt) {
  if (yt === map[0].length - 1) {
    return true;
  }
  const id = map[xt][yt + 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given a cell location, return if the cell above/below/left/right of it is traversable
 */
function traversableInDirection(map, x, y, direction) {
  switch (direction) {
    case 'UP':
      return y !== 0 && getTileProperty(map[x][y - 1], 'traversable');
    case 'DOWN':
      return y !== map[0].length - 1 && getTileProperty(map[x][y + 1], 'traversable');
    case 'LEFT':
      return x !== 0 && getTileProperty(map[x - 1][y], 'traversable');
    case 'RIGHT':
      return x !== map.length - 1 && getTileProperty(map[x + 1][y], 'traversable');
    default:
      assert(false, `${direction} not in UP, DOWN, LEFT, RIGHT`);
      return null;
  }
}


/**
 * Given an angle wall location, return true if it is traversable. (An NT angle wall has NT tiles
 * surrounding it).
 */
function isAngleWallTraversable(map, x, y) {
  const id = map[x][y];
  if (tileHasName(id, 'ANGLE_WALL_1')) {
    return traversableInDirection(map, x, y, 'UP') || traversableInDirection(map, x, y, 'RIGHT');
  }
  if (tileHasName(id, 'ANGLE_WALL_2')) {
    return traversableInDirection(map, x, y, 'DOWN') || traversableInDirection(map, x, y, 'RIGHT');
  }
  if (tileHasName(id, 'ANGLE_WALL_3')) {
    return traversableInDirection(map, x, y, 'DOWN') || traversableInDirection(map, x, y, 'LEFT');
  }
  if (tileHasName(id, 'ANGLE_WALL_4')) {
    return traversableInDirection(map, x, y, 'UP') || traversableInDirection(map, x, y, 'LEFT');
  }
  assert(false, `Tile at ${x}, ${y} was not an angle wall`);
  return null;
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
  for (let xt = 0; xt < map.length; xt++) {
    for (let yt = 0; yt < map[0].length; yt++) {
      // Angle walls have a traversability edge
      if (tileIsAngleWall(map[xt][yt])) {
        // TODO: which of these is correct?
        // res.push({ xt, yt });
        if (isAngleWallTraversable(map, xt, yt)) res.push({ xt, yt });
      } else if (
        // Onlyt store edges of traversable tiles
        getTileProperty(map[xt][yt], 'traversable') && (
          wallOnLeft(map, xt, yt) ||
          wallOnRight(map, xt, yt) ||
          wallOnTop(map, xt, yt) ||
          wallOnBottom(map, xt, yt)
        )
      ) {
        res.push({ xt, yt });
      }
    }
  }
  return res;
}

function updateUnmergedEdgesAroundAngleWall(map, graph, xt, yt) {
  assert(tileIsAngleWall(map[xt][yt]), 'Tile was not an angle wall');
  const xp = xt * PPTL;
  const yp = yt * PPTL;
  const topLeft = new Point(xp, yp);
  const topRight = new Point(xp + PPTL, yp);
  const bottomLeft = new Point(xp, yp + PPTL);
  const bottomRight = new Point(xp + PPTL, yp + PPTL);

  // Add the diagonal edge of the wall
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_1', 'ANGLE_WALL_3'])) {
    graph.addEdgeAndVertices(topLeft, bottomRight);
  } else if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_2', 'ANGLE_WALL_4'])) {
    graph.addEdgeAndVertices(bottomLeft, topRight);
  }

  // Check each of the four edges of the tile, and if there is a NT-wall touch a traversable side of
  //   tile, add a graph edge

  // Check the top edge
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) {
    if (wallOnTop(map, xt, yt)) graph.addEdgeAndVertices(topLeft, topRight);
    else graph.removeEdgeAndVertices(topLeft, topRight);
  }
  // Check the bottom edge
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) {
    if (wallOnBottom(map, xt, yt)) graph.addEdgeAndVertices(bottomLeft, bottomRight);
    else graph.removeEdgeAndVertices(bottomLeft, bottomRight);
  }
  // Check the left edge
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) {
    if (wallOnLeft(map, xt, yt)) graph.addEdgeAndVertices(bottomLeft, topLeft);
    else graph.removeEdgeAndVertices(bottomLeft, topLeft);
  }
  // Check the right edge
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_1', 'ANGLE_WALL_2'])) {
    if (wallOnRight(map, xt, yt)) graph.addEdgeAndVertices(bottomRight, topRight);
    else graph.removeEdgeAndVertices(bottomRight, topRight);
  }
}

function updateUnmergedEdgesAroundTraversableTile(map, graph, xt, yt) {
  assert(getTileProperty(map[xt][yt], 'traversable'), 'Function called with an NT tile');
  const xp = xt * PPTL;
  const yp = yt * PPTL;
  const topLeft = new Point(xp, yp);
  const topRight = new Point(xp + PPTL, yp);
  const bottomLeft = new Point(xp, yp + PPTL);
  const bottomRight = new Point(xp + PPTL, yp + PPTL);

  // Use similar logic as the angle wall function to update edges in the unmerged graph
  if (wallOnLeft(map, xt, yt)) graph.addEdgeAndVertices(topLeft, bottomLeft);
  else graph.removeEdgeAndVertices(topLeft, bottomLeft);

  if (wallOnRight(map, xt, yt)) graph.addEdgeAndVertices(topRight, bottomRight);
  else graph.removeEdgeAndVertices(topRight, bottomRight);

  if (wallOnTop(map, xt, yt)) graph.addEdgeAndVertices(topLeft, topRight);
  else graph.removeEdgeAndVertices(topLeft, topRight);

  if (wallOnBottom(map, xt, yt)) graph.addEdgeAndVertices(bottomLeft, bottomRight);
  else graph.removeEdgeAndVertices(bottomLeft, bottomRight);
}

function updateUnmergedEdgesAroundCompletelyNTTile(map, graph, xt, yt) {
  assert(
    !getTileProperty(map[xt][yt], 'traversable') &&
    !tileIsAngleWall(map[xt][yt]),
    'Function called with a traversable tile or angle wall',
  );
  const xp = xt * PPTL;
  const yp = yt * PPTL;
  const topLeft = new Point(xp, yp);
  const topRight = new Point(xp + PPTL, yp);
  const bottomLeft = new Point(xp, yp + PPTL);
  const bottomRight = new Point(xp + PPTL, yp + PPTL);

  // Use similar logic as the angle wall function to update edges in the unmerged graph
  if (!wallOnLeft(map, xt, yt)) graph.addEdgeAndVertices(topLeft, bottomLeft);
  else graph.removeEdgeAndVertices(topLeft, bottomLeft);

  if (!wallOnRight(map, xt, yt)) graph.addEdgeAndVertices(topRight, bottomRight);
  else graph.removeEdgeAndVertices(topRight, bottomRight);

  if (!wallOnTop(map, xt, yt)) graph.addEdgeAndVertices(topLeft, topRight);
  else graph.removeEdgeAndVertices(topLeft, topRight);

  if (!wallOnBottom(map, xt, yt)) graph.addEdgeAndVertices(bottomLeft, bottomRight);
  else graph.removeEdgeAndVertices(bottomLeft, bottomRight);
}

/**
 * Given the tagpro map, return a Graph object containing edges along the edge of traversability.
 *   Each edge should be length tile-length one (or sqrt(2), if it lies on the diagonal of a tile)
 * @param {{number|string}} map - the tagpro map
 * @returns {Graph}
 */
export function unmergedGraphFromTagproMap(map) {
  const edgeTiles = mapToEdgeTiles(map);
  const graph = new Graph();
  _.forEach(edgeTiles, tile => {
    const { xt, yt } = tile;
    if (tileIsAngleWall(map[xt][yt])) updateUnmergedEdgesAroundAngleWall(map, graph, xt, yt);
    else {
      assert(getTileProperty(map[xt][yt], 'traversable'), 'NT tile found in edgeTiles');
      updateUnmergedEdgesAroundTraversableTile(map, graph, xt, yt);
    }
  });
  return graph;
}


export function squashVertex(mergedGraph, vertex) {
  const neighbors = mergedGraph.neighbors(vertex);
  if (neighbors.length === 2 && threePointsInLine(vertex, neighbors[0], neighbors[1])) {
    mergedGraph.removeEdgeAndVertices(vertex, neighbors[0]);
    mergedGraph.removeEdgeAndVertices(vertex, neighbors[1]);
    mergedGraph.addEdge(neighbors[0], neighbors[1]);
  }
}


/**
 * Given the tagpro map, return a Graph object containing edges along the edge of traversability.
 *   Straight lines will be represented by a single edge (the edges are arbitrarily long). This is
 *   computed using the unmergedGraphFromTagproMap function above, and then merging edges that touch
 *   eachother and have the same slope.
 * @param {{number|string}[][]} map - the tagpro map
 * @returns {Graph}
 */
export function graphFromTagproMap(map, unmergedGraph) {
  // const unmergedGraph = unmergedGraphFromTagproMap(map);
  const G = unmergedGraph.copy();
  _.forEach(G.getVertices(), v => {
    squashVertex(G, v);
  });
  // Remove all vertices that no longer have a neighbor
  _.forEach(G.getVertices(), v => {
    if (G.neighbors(v).length === 0) G.removeVertex(v);
  });
  return G;
}


/**
 * Given the location of a tile which changed states, update the unmerged graph
 * @param {Graph} unmergedGraph
 * @param {{number|string}[][]} map - the tagpro map
 * @param {number} xt - x, in tiles
 * @param {number} yt - y, in tiles
 */
export function updateUnmergedGraph(unmergedGraph, map, xt, yt) {
  if (tileIsAngleWall(map[xt][yt])) {
    if (isAngleWallTraversable(map, xt, yt)) {
      updateUnmergedEdgesAroundAngleWall(map, unmergedGraph, xt, yt);
    } else {
      updateUnmergedEdgesAroundCompletelyNTTile(map, unmergedGraph, xt, yt);
    }
  } else if (getTileProperty(map[xt][yt], 'traversable')) {
    updateUnmergedEdgesAroundTraversableTile(map, unmergedGraph, xt, yt);
  } else {
    updateUnmergedEdgesAroundCompletelyNTTile(map, unmergedGraph, xt, yt);
  }
}

function updateMergedEdge(mergedGraph, unmergedGraph, bigE, smallE) {
  // Make sure the bigE is an edge in the mergedGraph
  assert(mergedGraph.isConnected(bigE.p1, bigE.p2));
  assert(edgesInALine(bigE, smallE));
  // If these edges are vertical
  const vert = bigE.p1.x === bigE.p2.x;
  // Find the left-most, or if they're vertical, top-most points of each edge
  const bigP1 = _.minBy([bigE.p1, bigE.p2], p => (vert ? p.y : p.x));
  const bigP2 = _.maxBy([bigE.p1, bigE.p2], p => (vert ? p.y : p.x));
  const smallP1 = _.minBy([smallE.p1, smallE.p2], p => (vert ? p.y : p.x));
  const smallP2 = _.maxBy([smallE.p1, smallE.p2], p => (vert ? p.y : p.x));
  // If lines are vertical, than P1s should have smaller Y
  assert(!vert || bigP1.y <= bigP2.y);
  assert(!vert || smallP1.y <= smallP2.y);

  // Check if the big edge completely surrounds the small edge
  if ((vert && (bigP1.y <= smallP1.y && bigP2.y >= smallP2.y)) ||
               (bigP1.x <= smallP1.x && bigP2.x >= smallP2.x)) {
    mergedGraph.removeEdge(bigP1, bigP2);
    const e1 = { p1: bigP1, p2: smallP1 };
    const e2 = { p1: smallP2, p2: bigP2 };
    if (!e1.p1.equal(e1.p2)) {
      mergedGraph.addEdgeAndVertices(e1.p1, e1.p2);
    }
    if (!e2.p1.equal(e2.p2)) {
      mergedGraph.addEdgeAndVertices(e2.p1, e2.p2);
    }
  }
}

export function edgesInLineWith(graph, e) {
  const inlineEdges = _.filter(graph.getEdges(), edge => edgesInALine(e, edge));
  return inlineEdges;
}

/**
 * Given the location of a tile which changed states, update the merged graph
 * @param {Graph} mergedGraph
 * @param {Graph} unmergedGraph
 * @param {{number|string}[][]} map - the tagpro map
 * @param {number} xt - x, in tiles
 * @param {number} yt - y, in tiles
 */
export function updateMergedGraph(mergedGraph, unmergedGraph, map, xt, yt) {
  const xp = xt * PPTL;
  const yp = yt * PPTL;
  const topLeft = new Point(xp, yp);
  const topRight = new Point(xp + PPTL, yp);
  const bottomLeft = new Point(xp, yp + PPTL);
  const bottomRight = new Point(xp + PPTL, yp + PPTL);
  const edges = [
    { p1: topLeft, p2: topRight },
    { p1: topLeft, p2: bottomLeft },
    { p1: bottomLeft, p2: bottomRight },
    { p1: topRight, p2: bottomRight },
    { p1: topLeft, p2: bottomRight },
    { p1: bottomLeft, p2: topRight },
  ];
  _.forEach(edges, smallE => {
    const inlineEdges = edgesInLineWith(mergedGraph, smallE);
    _.forEach(inlineEdges, bigE => {
      updateMergedEdge(mergedGraph, unmergedGraph, bigE, smallE);
    });
    if (unmergedGraph.isConnected(smallE.p1, smallE.p2)) {
      mergedGraph.addEdgeAndVertices(smallE.p1, smallE.p2);
    }
  });
  const surroundingPoints = [topLeft, topRight, bottomRight, bottomLeft];
  for (let i = 0; i < surroundingPoints.length; i += 1) {
    const point = surroundingPoints[i];
    const dummyDiag = {
      p1: new Point(point.x - 1, point.y + ((i % 2) ? -1 : 1)),
      p2: new Point(point.x + 1, point.y + ((i % 2) ? 1 : -1)),
    };
    const inlineDiagEdges = edgesInLineWith(mergedGraph, dummyDiag);
    _.forEach(inlineDiagEdges, diagEdge => {
      // Split apart the diagonal edge if it contains the point
      updateMergedEdge(mergedGraph, unmergedGraph, diagEdge, { p1: point, p2: point });
    });
    if (mergedGraph.neighbors(point).length === 0) mergedGraph.removeVertex(point);
    if (mergedGraph.hasVertex(point)) squashVertex(mergedGraph, point);
  }
}

