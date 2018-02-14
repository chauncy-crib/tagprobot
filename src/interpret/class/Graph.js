import _ from 'lodash';

import { assert } from '../../global/utils';
import { areEdgesCollinear } from '../utils';


/**
 * Represents the polygons as a graph, with vertices and edges surrounding the polygons.
 */
export class Graph {
  constructor() {
    this.adj = {}; // map from point object to list of adjacent points
    this.vertices = [];
  }


  addEdge(p1, p2) {
    assert(_.has(this.adj, p1), `${p1} not initialized in the graph with addVertex()`);
    assert(_.has(this.adj, p2), `${p2} not initialized in the graph with addVertex()`);
    if (this.isConnected(p1, p2)) {
      return;
    }
    this.adj[p1].push(p2);
    this.adj[p2].push(p1);
  }


  addEdgeAndVertices(p1, p2) {
    this.addVertex(p1);
    this.addVertex(p2);
    this.addEdge(p1, p2);
  }


  /**
  * Removes the edge between two points, if they are connected. If after removal, either point has
  *   no neighbors, it is removed.
  */
  removeEdgeAndVertices(p1, p2) {
    this.removeEdge(p1, p2);
    if (this.neighbors(p1).length === 0) this.removeVertex(p1);
    if (this.neighbors(p2).length === 0) this.removeVertex(p2);
  }


  removeEdge(p1, p2) {
    this.adj[p1] = _.reject(this.adj[p1], p => p.equals(p2));
    this.adj[p2] = _.reject(this.adj[p2], p => p.equals(p1));
  }


  /**
   * Removes a vertex from the graph, and clears all edges connected to it.
   */
  removeVertex(vertex) {
    // Clear all edges attached to the vertex
    _.forEach(this.adj[vertex], a => {
      this.removeEdge(vertex, a);
    });
    // Remove the vertex
    delete this.adj[vertex];
    this.vertices = _.reject(this.vertices, v => vertex.equals(v));
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
    _.forEach(this.getEdges(), e => g.addEdge(e.p1, e.p2));
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
   * Adds a point to the graph
   * @returns {boolean} if the point was successfully added
   */
  addVertex(point) {
    assert(!_.isNil(point), 'Point was undefined');
    // Only add vertex if it doesn't already exist in the graph
    if (this.hasVertex(point)) return false;
    this.adj[point] = [];
    this.vertices.push(point);
    return true;
  }


  /**
   * @returns {Point[]} all vertices in the graph
   */
  getVertices() {
    // Return a copy of the vertices list
    return _.cloneDeep(this.vertices);
  }


  /**
   * @returns {number} the number of vertices in the graph
   */
  numVertices() {
    return this.getVertices().length;
  }


  /**
   * @param {Graph} graph
   * @param {{x: number, y: number}} e
   * @returns {{x: number, y: number}[]} all edges from the graph which are in-line with the input
   *   edge. (Ie, they have identical slopes, and x and y intercepts).
   */
  edgesInLineWith(e) {
    return _.filter(this.getEdges(), edge => areEdgesCollinear(e, edge));
  }


  getEdges() {
    const edges = [];
    _.forEach(this.vertices, p1 => {
      _.forEach(this.adj[p1], p2 => {
        const edgeExists = _.some(edges, e => (
          (e.p1.equals(p1) && e.p2.equals(p2)) ||
          (e.p1.equals(p2) && e.p2.equals(p1))
        ));
        if (!edgeExists) edges.push({ p1, p2 });
      });
    });
    return edges;
  }


  /**
   * @returns {number} the number of edges in the graph
   */
  numEdges() {
    return this.getEdges().length;
  }
}
