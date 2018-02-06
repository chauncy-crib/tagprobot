import _ from 'lodash';

import { assert } from '../utils/asserts';
import { detH } from './interpret';
import { Point, sortCounterClockwise } from './point';
import { Triangle } from './triangle';
import { TGraph } from './triangleGraph';
import {
  updateMergedGraph,
  updateUnmergedGraph,
  unmergedGraphFromTagproMap,
  graphFromTagproMap,
} from './mapToGraph';
import { getTileProperty } from '../look/tileInfo';
import { redrawNavMesh } from '../draw/triangulation';


// A list of x, y pairs, which are the locations in the map that might change
const tilesToUpdate = [];
const tilesToUpdateValues = []; // the values stored in those locations
const internalMap = [];

let unmergedGraph;
let mergedGraph;
const DTGraph = new TGraph();


export function initInternalMap(map) {
  assert(_.isEmpty(internalMap), 'internalMap not empty when initializing');
  // Modify in place rather than declare with a let
  for (let i = 0; i < map.length; i++) internalMap.push(_.clone(map[i]));
}


/**
 * @param {Graph} mapGraph - a graph with vertices and edges surrounding the traversable area
 * @param {Point} dummyPoint1 - a dummy point to start the triangulation with. Dummy points 1-3
 *   should surround all other vertices that will get added. This function will assertion error if
 *   they don't
 * @param {boolean} removeDummy - true if the dummy points should be removed from the triangulation
 *   after it is complete.
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function delaunayTriangulation(
  mapGraph,
  dummyPoint1,
  dummyPoint2,
  dummyPoint3,
  removeDummy = false,
) {
  const numVertices = DTGraph.getVertices().length;
  assert(numVertices === 0, `DTGraph had ${numVertices} vertices.`);
  const vertices = mapGraph.getVertices();

  const t = new Triangle(dummyPoint1, dummyPoint2, dummyPoint3);
  DTGraph.addTriangle(t);

  const shuffledVertices = _.shuffle(vertices);
  // Check if dummy triangle contains each point
  _.forEach(shuffledVertices, v => {
    assert(
      DTGraph.findContainingTriangles(v).length === 1,
      `Dummy triangle did not contain point at ${v.x}, ${v.y}`,
    );
  });
  _.forEach(shuffledVertices, vertex => {
    DTGraph.delaunayAddVertex(vertex);
  });

  const shuffledEdges = _.shuffle(mapGraph.getEdges());
  _.forEach(shuffledEdges, e => {
    DTGraph.delaunayAddConstraintEdge(e);
  });

  if (removeDummy) {
    _.forEach([dummyPoint1, dummyPoint2, dummyPoint3], dummyPoint => {
      DTGraph.removeVertexAndTriangles(dummyPoint);
    });
  }
}


export function getMergedGraph() {
  return mergedGraph;
}

export function getUnmergedGraph() {
  return unmergedGraph;
}


/**
 * @param {num} map - array of all vertices
 * @param {boolean} removeDummy - true if the dummy points should be removed from the triangulation
 *   after it is complete.
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function calculateNavMesh(map, removeDummy = false) {
  unmergedGraph = unmergedGraphFromTagproMap(map);
  mergedGraph = graphFromTagproMap(map, unmergedGraph);
  delaunayTriangulation(
    mergedGraph,
    new Point(-9999, -100),
    new Point(9999, -100),
    new Point(0, 9999),
    removeDummy,
  );
}


export function getDTGraph() {
  return DTGraph;
}


/**
 * Parse through each tile in the map and store non-permanent tiles in tilesToUpdate and
 *   tilesToUpdateValues
 * @param {number} map - 2D array representing the Tagpro map
 */
export function setupTilesToUpdate(map) {
  const xtl = map.length;
  const ytl = map[0].length;
  for (let xt = 0; xt < xtl; xt++) {
    for (let yt = 0; yt < ytl; yt++) {
      const tileId = map[xt][yt];
      if (!getTileProperty(tileId, 'permanent')) {
        tilesToUpdate.push({ xt, yt });
        tilesToUpdateValues.push(tileId);
      }
    }
  }
}


/**
 * Given the tagpro map and a tile location which has changed state, update the unmergedGraph,
 *   mergedGraph, and polypointGraph
 */
export function updateNavMesh(map, xt, yt) {
  updateUnmergedGraph(getUnmergedGraph(), map, xt, yt);
  const { unfixEdges, constrainingEdges, removeVertices, addVertices } =
    updateMergedGraph(getMergedGraph(), getUnmergedGraph(), map, xt, yt);
  getDTGraph().dynamicUpdate(unfixEdges, constrainingEdges, removeVertices, addVertices);
}


/**
 * Looks through the map, checks for tiles that have changed traversability states and updates the
 *   navmesh around those tiles.
 * @param {number} map - 2D array representing the Tagpro map
 */
export function updateAndRedrawEntireNavmesh(map) {
  assert(
    tilesToUpdate.length === tilesToUpdateValues.length,
    'the number of tiles to update and the number of values stored for them are not equal',
  );
  let tileChanged = false;
  for (let i = 0; i < tilesToUpdate.length; i++) {
    const xy = tilesToUpdate[i];
    const tileId = map[xy.xt][xy.yt];
    const tileTraversability = getTileProperty(tileId, 'traversable');
    internalMap[xy.xt][xy.yt] = map[xy.xt][xy.yt];
    // if the traversability of the tile in this location has changed since the last state
    if (tileTraversability !== getTileProperty(tilesToUpdateValues[i], 'traversable')) {
      tileChanged = true;
      tilesToUpdateValues[i] = tileId;
      updateNavMesh(internalMap, xy.xt, xy.yt);
    }
  }
  if (tileChanged) redrawNavMesh();
}


/**
 * Checks if edge e is delaunay-legal with respect to the inserted point
 * @param {Point} insertedPoint - the point being added to the triangulation
 * @param {{p1: Point, p2: Point}} e - the edge we are checking for legality
 * @param {Point} oppositePoint - The third point of the adjacent triangle to e.p1, e.p2,
 *   insertedPoint
 * @returns {boolean} true if the opposite point is not inside the circle which touches e.p1, e.p2,
 *   insertedPoint
 */
export function isLegal(insertedPoint, e, oppositePoint) {
  const [A, B, C] = sortCounterClockwise([insertedPoint, e.p1, e.p2]);
  const E = oppositePoint;
  return detH(A, B, C, E) <= 0;
}
