import _ from 'lodash';
import { graphFromTagproMap } from './polygon';
import { TGraph, Point, Triangle } from './graph';
import { assert } from '../utils/asserts';


const DTGraph = new TGraph();


/**
 * @param {Point[]} vertices - array of all vertices
 * @returns {Point} the highest and right-most vertex
 */
export function getHighestPoint(vertices) {
  const highestYValue = _.minBy(vertices, v => v.y).y;
  const highestPoints = _.filter(vertices, v => v.y === highestYValue);
  return _.maxBy(highestPoints, v => v.x);
}


/**
 * TODO treat p-1 and p-2 symbollically
 * @param {Point[]} vertices - array of all vertices
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function delaunayTriangulation(vertices, dummyPoint1, dummyPoint2) {
  const highestP = getHighestPoint(vertices);

  const t = new Triangle(highestP, dummyPoint1, dummyPoint2);
  DTGraph.addTriangle(t);

  const shuffledVertices = _.shuffle(_.without(vertices, highestP));
  // Check if dummy triangle contains each point
  _.forEach(shuffledVertices, vertex => {
    assert(DTGraph.findContainingTriangles(vertex).length === 1);
  });
  _.forEach(shuffledVertices, vertex => {
    DTGraph.addTriangulationVertex(vertex);
  });
  DTGraph.removeVertexAndTriangles(dummyPoint1);
  DTGraph.removeVertexAndTriangles(dummyPoint2);
  return shuffledVertices;
}


/**
 * @param {num} map - array of all vertices
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function calculateNavMesh(map) {
  const mapGraph = graphFromTagproMap(map);
  delaunayTriangulation(
    mapGraph.getVertices(),
    new Point(-3000000, -100),
    new Point(14000000, 10000000),
  );
}


export function getDTGraph() {
  return DTGraph;
}
