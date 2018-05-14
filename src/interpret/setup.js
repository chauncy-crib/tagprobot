import _ from 'lodash';

import { assert } from '../global/utils';
import { timeLog } from '../global/timing';
import { getTileProperty } from '../look/tileInfo';
import { Point } from '../global/class/Point';
import { Triangle } from './class/Triangle';
import { TriangleGraph } from './class/TriangleGraph';
import { unmergedGraphFromTagproMap, graphFromTagproMap } from './mapToGraph';
import {
  getDTGraph,
  getMergedGraph,
  getUnmergedGraph,
  setDtGraph,
  setUnmergedGraph,
  setMergedGraph,
  setMapName,
  setMapAuthor,
  internalMap,
  tilesToUpdate,
  tilesToUpdateValues,
} from './interpret';


export function onMapReady(fn) {
  tagpro.socket.on('map', mapData => {
    timeLog('Map info recieved.');
    setMapName(mapData.info.name);
    setMapAuthor(mapData.info.author);
    fn();
  });
}


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
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function delaunayTriangulation(
  mapGraph,
  dummyPoint1,
  dummyPoint2,
  dummyPoint3,
) {
  const dtGraph = getDTGraph();
  const numVertices = dtGraph.getVertices().length;
  assert(numVertices === 0, `dtGraph had ${numVertices} vertices.`);
  const vertices = mapGraph.getVertices();

  const t = new Triangle(dummyPoint1, dummyPoint2, dummyPoint3);
  dtGraph.addFirstTriangle(t, true);

  const shuffledVertices = _.shuffle(vertices);
  // Check if dummy triangle contains each point
  _.forEach(shuffledVertices, v => {
    assert(
      dtGraph.findContainingTriangles(v).length === 1,
      `Dummy triangle did not contain point at ${v.x}, ${v.y}`,
    );
  });
  _.forEach(shuffledVertices, vertex => {
    dtGraph.delaunayAddVertex(vertex);
  });
  timeLog('Added triangulation vertices.');

  const shuffledEdges = _.shuffle(mapGraph.getEdges());
  _.forEach(shuffledEdges, e => {
    dtGraph.delaunayAddConstraintEdge(e);
  });
  timeLog('Added triangulation constrained edges.');
}


/**
 * @param {number[][]} map - the tagpro map
 * @param {boolean} [calcGraphs=true] - true if we need to calculated the merged/unmerged graphs
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function initNavMesh(map, calcGraphs = true) {
  if (calcGraphs) {
    setDtGraph(new TriangleGraph());
    setUnmergedGraph(unmergedGraphFromTagproMap(map));
    timeLog('  Created unmerged graph.');
    setMergedGraph(graphFromTagproMap(map, getUnmergedGraph()));
    timeLog('  Created merged graph.');
    delaunayTriangulation(
      getMergedGraph(),
      new Point(-9999, -100),
      new Point(9999, -100),
      new Point(0, 9999),
    );
  }
}
