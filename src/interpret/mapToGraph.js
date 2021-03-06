import _ from 'lodash';

import { PPTL } from '../global/constants';
import { assert } from '../global/utils';
import { threePointsInLine } from './utils';
import { Point } from '../global/class/Point';
import { Edge } from '../global/class/Edge';
import { Graph } from '../global/class/Graph';
import { getTileProperty, tileIsOneOf, tileIsAngleWall } from '../look/tileInfo';
import {
  wallOnLeft,
  wallOnRight,
  wallOnTop,
  wallOnBottom,
  isAngleWallTraversable,
} from '../look/around';


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
        if (isAngleWallTraversable(map, xt, yt)) res.push({ xt, yt });
      } else if (
        // Only store edges of traversable tiles
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
    graph.addEdgeAndVertices(new Edge(topLeft, bottomRight));
  } else if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_2', 'ANGLE_WALL_4'])) {
    graph.addEdgeAndVertices(new Edge(bottomLeft, topRight));
  }

  // Check each of the four edges of the tile, and if there is a NT-wall touching a traversable side
  // of tile, add a graph edge

  // Check the top edge
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) {
    if (wallOnTop(map, xt, yt)) graph.addEdgeAndVertices(new Edge(topLeft, topRight));
    else graph.removeEdgeAndVertices(new Edge(topLeft, topRight));
  }
  // Check the bottom edge
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) {
    if (wallOnBottom(map, xt, yt)) graph.addEdgeAndVertices(new Edge(bottomLeft, bottomRight));
    else graph.removeEdgeAndVertices(new Edge(bottomLeft, bottomRight));
  }
  // Check the left edge
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) {
    if (wallOnLeft(map, xt, yt)) graph.addEdgeAndVertices(new Edge(bottomLeft, topLeft));
    else graph.removeEdgeAndVertices(new Edge(bottomLeft, topLeft));
  }
  // Check the right edge
  if (tileIsOneOf(map[xt][yt], ['ANGLE_WALL_1', 'ANGLE_WALL_2'])) {
    if (wallOnRight(map, xt, yt)) graph.addEdgeAndVertices(new Edge(bottomRight, topRight));
    else graph.removeEdgeAndVertices(new Edge(bottomRight, topRight));
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
  if (wallOnLeft(map, xt, yt)) graph.addEdgeAndVertices(new Edge(topLeft, bottomLeft));
  else graph.removeEdgeAndVertices(new Edge(topLeft, bottomLeft));

  if (wallOnRight(map, xt, yt)) graph.addEdgeAndVertices(new Edge(topRight, bottomRight));
  else graph.removeEdgeAndVertices(new Edge(topRight, bottomRight));

  if (wallOnTop(map, xt, yt)) graph.addEdgeAndVertices(new Edge(topLeft, topRight));
  else graph.removeEdgeAndVertices(new Edge(topLeft, topRight));

  if (wallOnBottom(map, xt, yt)) graph.addEdgeAndVertices(new Edge(bottomLeft, bottomRight));
  else graph.removeEdgeAndVertices(new Edge(bottomLeft, bottomRight));
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
  if (!wallOnLeft(map, xt, yt)) graph.addEdgeAndVertices(new Edge(topLeft, bottomLeft));
  else graph.removeEdgeAndVertices(new Edge(topLeft, bottomLeft));

  if (!wallOnRight(map, xt, yt)) graph.addEdgeAndVertices(new Edge(topRight, bottomRight));
  else graph.removeEdgeAndVertices(new Edge(topRight, bottomRight));

  if (!wallOnTop(map, xt, yt)) graph.addEdgeAndVertices(new Edge(topLeft, topRight));
  else graph.removeEdgeAndVertices(new Edge(topLeft, topRight));

  if (!wallOnBottom(map, xt, yt)) graph.addEdgeAndVertices(new Edge(bottomLeft, bottomRight));
  else graph.removeEdgeAndVertices(new Edge(bottomLeft, bottomRight));
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


/**
 * Collapses a vertex in a graph, by check if it has exactly two neighbors, and that it and its two
 *   neighbors are all in line with eachother. If they are, then the vertex is removed, and the
 *   neighbors are connected to eachother.
 * @param {Graph} mergedGraph - a graph object where we want to collapse vertices
 * @param {Point} vertex - a vertex we want to collapse, if possible.
 */
export function squashVertex(mergedGraph, vertex) {
  const neighbors = mergedGraph.neighbors(vertex);
  if (neighbors.length === 2 && threePointsInLine(vertex, neighbors[0], neighbors[1])) {
    mergedGraph.removeEdgeAndVertices(new Edge(vertex, neighbors[0]));
    mergedGraph.removeEdgeAndVertices(new Edge(vertex, neighbors[1]));
    mergedGraph.addEdge(new Edge(neighbors[0], neighbors[1]));
  }
}


/**
 * Given an unmerged graph, return a Graph object containing edges along the edge of traversability.
 *   Straight lines will be represented by a single edge (the edges are arbitrarily long). This is
 *   computed using the unmergedGraphFromTagproMap function above, and then merging edges that touch
 *   eachother and have the same slope.
 * @param {Graph} unmergedGraph - an unmerged graph, generated using the unmergedGraphFromTagproMap
 *   function
 * @returns {Graph}
 */
export function graphFromTagproMap(map, unmergedGraph) {
  const G = unmergedGraph.copy();
  _.forEach(G.getVertices(), v => squashVertex(G, v));
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

/**
 * Updates an edge in the mergedGraph which is inline with a potential edge in the unmergedGraph.
 *   Breaks apart bigE where smallE lays on top of it. For example, if * represents vertices and -
 *   represents edges:
 *
 * bigE:
 *
 *  *---------*
 *
 * smallE:
 *
 *    * *
 *
 * after update:
 *
 *  *-* *-----*
 *
 * If smallE does not lay op top of bigE, no update is made.
 *
 * @param {Graph} mergedGraph
 * @param {Graph} unmergedGraph
 * @param {Edge} bigE - An edge in the mergedGraph which is inline with smallE
 * @param {Edge} smallE - An edge which may or may not be in the unmergedGraph,
 *   which spans one tile-length, or diagonally across one tile.
 */
function breakApartMergedEdge(mergedGraph, unmergedGraph, bigE, smallE) {
  // Make sure the bigE is an edge in the mergedGraph
  assert(mergedGraph.isConnected(bigE.p1, bigE.p2));
  assert(bigE.isCollinearWithEdge(smallE));
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
      (!vert && (bigP1.x <= smallP1.x && bigP2.x >= smallP2.x))) {
    mergedGraph.removeEdge(new Edge(bigP1, bigP2));
    const e1 = new Edge(bigP1, smallP1);
    const e2 = new Edge(smallP2, bigP2);
    if (!e1.p1.equals(e1.p2)) {
      mergedGraph.addEdgeAndVertices(e1);
    }
    if (!e2.p1.equals(e2.p2)) {
      mergedGraph.addEdgeAndVertices(e2);
    }
  }
}

/**
 * Given the location of a tile which changed states, update the merged graph
 * @param {Graph} mergedGraph
 * @param {Graph} unmergedGraph
 * @param {{number|string}[][]} map - the tagpro map
 * @param {number} xt - x, in tiles
 * @param {number} yt - y, in tiles
 * @returns { unfixEdges, constrainingEdges, removeVertices, addVertices } the edges that were
 *   removed from the merged graph, added to the merged graph, the vertices that were removed from
 *   the merged graph, and added to the merged graph
 */
export function updateMergedGraph(mergedGraph, unmergedGraph, map, xt, yt) {
  // Keep track of the vertices and edges that were in the merged graph before this function was
  //   called
  const beforeVertices = mergedGraph.getVertices();
  const beforeEdges = mergedGraph.getEdges();
  const xp = xt * PPTL;
  const yp = yt * PPTL;
  const topLeft = new Point(xp, yp);
  const topRight = new Point(xp + PPTL, yp);
  const bottomLeft = new Point(xp, yp + PPTL);
  const bottomRight = new Point(xp + PPTL, yp + PPTL);
  // Check all 6 possible edges that can lay across/around this tile in the unmerged graph
  const edges = [
    new Edge(topLeft, topRight),
    new Edge(topLeft, bottomLeft),
    new Edge(bottomLeft, bottomRight),
    new Edge(topRight, bottomRight),
    new Edge(topLeft, bottomRight),
    new Edge(bottomLeft, topRight),
  ];
  // For each of the 6 edges, either merge together the edges that lay in line with it (ie, this
  //   edge connects two edges separated by one tile) or break them apart (if an edge lays across an
  //   edge in the unmerged graph which doesn't exist)
  _.forEach(edges, smallE => {
    const inlineEdges = mergedGraph.edgesInLineWith(smallE);
    _.forEach(inlineEdges, bigE => {
      breakApartMergedEdge(mergedGraph, unmergedGraph, bigE, smallE);
    });
    if (unmergedGraph.isConnected(smallE.p1, smallE.p2)) {
      mergedGraph.addEdgeAndVertices(new Edge(smallE.p1, smallE.p2));
    }
  });
  // Check if any diagonal edges intersect the corners of this tile that need to now be split in
  //   half. Then, squash the vertices at the corners of this tile
  const surroundingPoints = [topLeft, topRight, bottomRight, bottomLeft];
  for (let i = 0; i < surroundingPoints.length; i += 1) {
    const point = surroundingPoints[i];
    // Create the diagonal intersecting this corner
    const dummyDiag = new Edge(
      new Point(point.x - 1, point.y + ((i % 2) ? -1 : 1)),
      new Point(point.x + 1, point.y + ((i % 2) ? 1 : -1)),
    );
    const inlineDiagEdges = mergedGraph.edgesInLineWith(dummyDiag);
    _.forEach(inlineDiagEdges, diagEdge => {
      // Split apart the diagonal edge if it contains the point
      breakApartMergedEdge(mergedGraph, unmergedGraph, diagEdge, new Edge(point, point));
    });
    // Squash the vertex
    if (mergedGraph.hasVertex(point)) {
      if (mergedGraph.neighbors(point).length === 0) mergedGraph.removeVertex(point);
      else squashVertex(mergedGraph, point);
    }
  }
  const afterVertices = mergedGraph.getVertices();
  const afterEdges = mergedGraph.getEdges();
  // Unfix all edges that existed before but do not anymore
  const unfixEdges = _.reject(beforeEdges, b => _.some(afterEdges, a => a.equals(b)));
  // Add constraining edges that didn't exist previously
  const constrainingEdges = _.reject(
    afterEdges,
    a => _.some(beforeEdges, b => a.equals(b)),
  );
  // Remove vertices that now are not in the merged graph
  const removeVertices = _.reject(beforeVertices, b => _.some(afterVertices, a => a.equals(b)));
  // Add vertices that were not previously in the merged graph
  const addVertices = _.reject(afterVertices, a => _.some(beforeVertices, b => a.equals(b)));
  return { unfixEdges, constrainingEdges, removeVertices, addVertices };
}

