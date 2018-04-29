import _ from 'lodash';

import { assert, timeLog } from '../global/utils';
import { getTileProperty } from '../look/tileInfo';
import { Point } from './class/Point';
import { Triangle } from './class/Triangle';
import { TriangleGraph } from './class/TriangleGraph';
import { unmergedGraphFromTagproMap, graphFromTagproMap } from './mapToGraph';


export const internalMap = [];

// A list of x, y pairs, which are the locations in the map that might change
export const tilesToUpdate = [];
export const tilesToUpdateValues = []; // the values stored in those locations

let dtGraph;
let unmergedGraph;
let mergedGraph;


export function initInternalMap(map) {
  assert(_.isEmpty(internalMap), 'internalMap not empty when initializing');
  // Modify in place rather than declare with a let
  for (let i = 0; i < map.length; i++) internalMap.push(_.clone(map[i]));
}


/**
 * Parse through each tile in the map and store non-permanent tiles in tilesToUpdate and
 *   tilesToUpdateValues
 * @param {number} map - 2D array representing the Tagpro map
 */
export function initTilesToUpdate(map) {
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
  const numVertices = dtGraph.getVertices().length;
  assert(numVertices === 0, `dtGraph had ${numVertices} vertices.`);
  const vertices = mapGraph.getVertices();

  const t = new Triangle(dummyPoint1, dummyPoint2, dummyPoint3);
  dtGraph.addFirstTriangle(t, true);

  const shuffledVertices = _.shuffle(vertices);
  // Check if dummy triangle contains each point
  _.forEach(shuffledVertices, v => {
    assert(
      dtGraph.rootNode.findContainingNodes(v).length === 1,
      `Dummy triangle did not contain point at ${v.x}, ${v.y}`,
    );
  });
  timeLog('  Adding vertices...');
  _.forEach(shuffledVertices, vertex => {
    dtGraph.delaunayAddVertex(vertex, true);
  });

  timeLog('  Adding constrained edges...');
  const shuffledEdges = _.shuffle(mapGraph.getEdges());
  _.forEach(shuffledEdges, e => {
    dtGraph.delaunayAddConstraintEdge(e, true);
  });

  if (removeDummy) {
    _.forEach([dummyPoint1, dummyPoint2, dummyPoint3], dummyPoint => {
      dtGraph.removeVertexAndTriangles(dummyPoint);
    });
  }
}


/**
 * @param {num} map - array of all vertices
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function initNavMesh(map) {
  dtGraph = new TriangleGraph();
  unmergedGraph = unmergedGraphFromTagproMap(map);
  mergedGraph = graphFromTagproMap(map, unmergedGraph);
  delaunayTriangulation(
    mergedGraph,
    new Point(-9999, -100),
    new Point(9999, -100),
    new Point(0, 9999),
    false,
  );
}


export function getMergedGraph() {
  return mergedGraph;
}


export function getUnmergedGraph() {
  return unmergedGraph;
}


export function getDTGraph() {
  return dtGraph;
}
