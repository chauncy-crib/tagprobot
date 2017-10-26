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
  const p0 = getHighestPoint(vertices);
  // TODO treat p-1 and p-2 symbollically
  const pn1 = new Point(-100, 16);
  const pn2 = new Point(100, 16);

  const t = new Triangle(p0, pn1, pn2);
  DTGraph.addTriangle(t);

  const shuffledVertices = _.shuffle(_.without(vertices, p0));
  _.forEach(shuffledVertices, vertex => {
    DTGraph.addVertex(vertex);
  });
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
