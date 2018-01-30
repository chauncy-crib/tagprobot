import _ from 'lodash';
import { unmergedGraphFromTagproMap, graphFromTagproMap } from './polygon';
import { TGraph, Point, Triangle } from './graph';
import { assert } from '../utils/asserts';


let unmergedGraph;
let mergedGraph;
const DTGraph = new TGraph();


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
    DTGraph.addTriangulationVertex(vertex);
  });

  const shuffledEdges = _.shuffle(mapGraph.getEdges());
  _.forEach(shuffledEdges, e => {
    DTGraph.addConstraintEdge(e);
  });

  if (removeDummy) {
    _.forEach([dummyPoint1, dummyPoint2, dummyPoint3], dummyPoint => {
      DTGraph.removeVertexAndTriangles(dummyPoint);
    });
  }
  DTGraph.calculatePolypointGraph();
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
