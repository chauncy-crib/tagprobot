import _ from 'lodash';
import { graphFromTagproMap } from './polygon';
import { TGraph, Point, Triangle } from './graph';


let DTGraph = new TGraph();


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
 * @param {Point[]} vertices - array of all vertices
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function delaunayTriangulation(vertices) {
  const highestP = getHighestPoint(vertices);
  // TODO treat p-1 and p-2 symbollically
  const pn1 = new Point(-100, 50);
  const pn2 = new Point(100, 50);

  const t = new Triangle(highestP, pn1, pn2);
  DTGraph.addTriangle(t);

  // TODO: actually shuffle the vertices
  // const shuffledVertices = _.shuffle(_.without(vertices, highestP));
  const shuffledVertices = _.without(vertices, highestP);
  _.forEach(shuffledVertices, vertex => {
    DTGraph.addTriangulationVertex(vertex);
  });
  DTGraph.removeVertexAndTriangles(pn1);
  DTGraph.removeVertexAndTriangles(pn2);
  return shuffledVertices;
}


/**
 * @param {num} map - array of all vertices
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function calculateNavMesh(map) {
  const mapGraph = graphFromTagproMap(map);
  DTGraph = mapGraph;
}


export function getDTGraph() {
  return DTGraph;
}
