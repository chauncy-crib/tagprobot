import _ from 'lodash';

import { assert } from '../../global/utils';
import { slope, intercept } from '../utils';
import { Point } from './Point';
import { Edge } from './Edge';


/**
 * Represents the polygons as a graph, with vertices and edges surrounding the polygons.
 */
export class Graph {
  constructor() {
    this.adj = {}; // map from point object to list of adjacent points
    this.collinearEdges = {}; // map from slope to intercept to list of edges
  }


  /**
   * Adds a point to the graph
   * @returns {boolean} if the point was successfully added
   */
  addVertex(point) {
    assert(!_.isNil(point), 'Point was undefined');
    // Only add vertex if it doesn't already exist in the graph
    if (this.hasVertex(point)) return false;
    this.adj[point] = [];
    return true;
  }


  addEdge(edge) {
    assert(_.has(this.adj, edge.p1), `${edge.p1} not initialized in the graph with addVertex()`);
    assert(_.has(this.adj, edge.p2), `${edge.p2} not initialized in the graph with addVertex()`);
    if (this.isConnected(edge.p1, edge.p2)) return;
    this.adj[edge.p1].push(edge.p2);
    this.adj[edge.p2].push(edge.p1);
    const m = slope(edge.p1, edge.p2);
    const b = intercept(edge.p1, edge.p2);
    if (!_.has(this.collinearEdges, m)) this.collinearEdges[m] = {};
    if (!_.has(this.collinearEdges[m], b)) this.collinearEdges[m][b] = [];
    this.collinearEdges[m][b].push(new Edge(edge.p1, edge.p2));
  }


  addEdgeAndVertices(edge) {
    this.addVertex(edge.p1);
    this.addVertex(edge.p2);
    this.addEdge(new Edge(edge.p1, edge.p2));
  }


  /**
   * Removes the edge between two points, if they are connected. If after removal, either point has
   *   no neighbors, it is removed.
   */
  removeEdgeAndVertices(p1, p2) {
    if (!this.isConnected(p1, p2)) return;
    this.removeEdge(new Edge(p1, p2));
    if (this.neighbors(p1).length === 0) this.removeVertex(p1);
    if (this.neighbors(p2).length === 0) this.removeVertex(p2);
  }


  /**
   * Removes the edge between two points, if they are connected.
   */
  removeEdge(edge) {
    if (!this.isConnected(edge.p1, edge.p2)) return;
    const m = slope(edge.p1, edge.p2);
    const b = intercept(edge.p1, edge.p2);
    this.collinearEdges[m][b] = _.reject(
      this.collinearEdges[m][b],
      e => e.equals(new Edge(edge.p1, edge.p2)),
    );
    if (_.isEmpty(this.collinearEdges[m][b])) delete this.collinearEdges[m][b];
    this.adj[edge.p1] = _.reject(this.adj[edge.p1], p => p.equals(edge.p2));
    this.adj[edge.p2] = _.reject(this.adj[edge.p2], p => p.equals(edge.p1));
  }


  /**
   * Removes a vertex from the graph, and clears all edges connected to it.
   */
  removeVertex(vertex) {
    // Clear all edges attached to the vertex
    _.forEach(this.adj[vertex], a => {
      this.removeEdge(new Edge(vertex, a));
    });
    // Remove the vertex
    delete this.adj[vertex];
  }


  isConnected(p1, p2) {
    if (!this.hasVertex(p1) || !this.hasVertex(p2)) return false;
    const N = this.neighbors(p1);
    // Return true if any of p1's neighbors are equal to p2
    return _.some(N, n => n.equals(p2));
  }


  copy() {
    const g = new Graph();
    _.forEach(this.getVertices(), v => g.addVertex(v));
    _.forEach(this.getEdges(), e => g.addEdge(new Edge(e.p1, e.p2)));
    return g;
  }


  /**
   * @returns {Point[]} the neighbors of the point
   */
  neighbors(p) {
    assert(this.hasVertex(p), `Cannot find neighbors of vertex not in graph: ${p}`);
    return this.adj[p];
  }


  hasVertex(p) {
    return _.has(this.adj, p);
  }


  /**
   * @returns {Point[]} all vertices in the graph
   */
  getVertices() {
    return _.map(_.keys(this.adj), s => Point.fromString(s));
  }


  /**
   * @returns {number} the number of vertices in the graph
   */
  numVertices() {
    return _.size(this.adj);
  }


  /**
   * @param {Graph} graph
   * @param {{x: number, y: number}} e
   * @returns {{x: number, y: number}[]} all edges from the graph which are in-line with the input
   *   edge. (Ie, they have identical slopes, and x and y intercepts).
   */
  edgesInLineWith(e) {
    const m = slope(e.p1, e.p2);
    const b = intercept(e.p1, e.p2);
    if (!_.has(this.collinearEdges, m)) return [];
    if (!_.has(this.collinearEdges[m], b)) return [];
    return this.collinearEdges[m][b];
  }


  getEdges() {
    const edgesSet = {};
    const edges = [];
    _.forEach(this.getVertices(), p1 => {
      _.forEach(this.adj[p1], p2 => {
        // Create new Point objects, because if the points are Polypoints, their toString method
        // includes the containing triangle.
        const e = { p1: new Point(p1.x, p1.y), p2: new Point(p2.x, p2.y) };
        const edgeExists = _.has(edgesSet, JSON.stringify(e));
        if (!edgeExists) {
          edges.push({ p1, p2 });
          edgesSet[JSON.stringify({ p1: new Point(p2.x, p2.y), p2: new Point(p1.x, p1.y) })] = true;
        }
      });
    });
    return edges;
  }


  /**
   * @returns {number} the number of edges in the graph
   */
  numEdges() {
    return _.sumBy(_.values(this.adj), l => l.length) / 2;
  }
}
