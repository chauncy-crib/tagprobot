import _ from 'lodash';

import { assert } from '../../global/utils';
import { Edge } from '../../global/class/Edge';
import { Point } from '../../global/class/Point';


/**
 * Represents the polygons as a graph, with vertices and edges surrounding the polygons.
 */
export class Graph {
  constructor() {
    this.adj = {}; // map from point string representation to list of adjacent points
    this.vertices = {}; // map from point string representation to actual point
    this.collinearEdges = {}; // map from slope to intercept to list of edges
  }


  // toNonCirc() {
  //   const o = {};
  //   o.adj = this.adj;
  //   o.vertices = this.vertices;
  //   o.collinearEdges = this.collinearEdges;
  //   return o;
  // }


  fromObject(o) {
    _.forOwn(o.adj, (adjList, pointStr) => {
      this.adj[pointStr] = _.map(adjList, p => (new Point()).fromObject(p));
    });
    _.forOwn(o.vertices, (point, pointStr) => {
      this.vertices[pointStr] = (new Point()).fromObject(point);
    });
    _.forOwn(o.collinearEdges, (interceptMap, slope) => {
      this.collinearEdges[slope] = {};
      _.forOwn(interceptMap, (edgeList, intercept) => {
        this.collinearEdges[slope][intercept] = _.map(edgeList, e => (new Edge()).fromObject(e));
      });
    });
    return this;
  }

  clear() {
    this.adj = {};
    this.vertices = {};
    this.collinearEdges = {};
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
    this.vertices[point] = point;
    return true;
  }


  /**
   * Adds an edge to the graph. Throws an error if either vertex is not in the graph.
   * @returns {boolean} if the edge was successfully added
   */
  addEdge(edge) {
    assert(this.hasVertex(edge.p1), `${edge.p1} not initialized in the graph with addVertex()`);
    assert(this.hasVertex(edge.p2), `${edge.p2} not initialized in the graph with addVertex()`);
    if (this.isConnected(edge.p1, edge.p2)) return false;
    this.adj[edge.p1].push(edge.p2);
    this.adj[edge.p2].push(edge.p1);
    const m = edge.getSlope();
    const b = edge.getIntercept();
    if (!_.has(this.collinearEdges, m)) this.collinearEdges[m] = {};
    if (!_.has(this.collinearEdges[m], b)) this.collinearEdges[m][b] = [];
    this.collinearEdges[m][b].push(edge);
    return true;
  }


  addEdgeAndVertices(edge) {
    this.addVertex(edge.p1);
    this.addVertex(edge.p2);
    this.addEdge(edge);
  }


  /**
   * Removes the edge between two points, if they are connected. If after removal, either point has
   *   no neighbors, it is removed.
   */
  removeEdgeAndVertices(edge) {
    if (!this.isConnected(edge.p1, edge.p2)) return;
    this.removeEdge(edge);
    if (this.neighbors(edge.p1).length === 0) this.removeVertex(edge.p1);
    if (this.neighbors(edge.p2).length === 0) this.removeVertex(edge.p2);
  }


  /**
   * Removes the edge between two points, if they are connected.
   */
  removeEdge(edge) {
    if (!this.isConnected(edge.p1, edge.p2)) return false;
    const m = edge.getSlope();
    const b = edge.getIntercept();
    this.collinearEdges[m][b] = _.reject(this.collinearEdges[m][b], e => e.equals(edge));
    if (_.isEmpty(this.collinearEdges[m][b])) delete this.collinearEdges[m][b];
    this.adj[edge.p1] = _.reject(this.adj[edge.p1], p => p.equals(edge.p2));
    this.adj[edge.p2] = _.reject(this.adj[edge.p2], p => p.equals(edge.p1));
    return true;
  }


  /**
   * Removes a vertex from the graph, and clears all edges connected to it. Returns true if the
   *   vertex was in the graph, false otherwise.
   */
  removeVertex(vertex) {
    if (!this.hasVertex(vertex)) return false;
    // Clear all edges attached to the vertex
    _.forEach(this.adj[vertex], a => {
      this.removeEdge(new Edge(vertex, a));
    });
    // Remove the vertex
    delete this.adj[vertex];
    delete this.vertices[vertex];
    return true;
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
    _.forEach(this.getEdges(), e => g.addEdge(e));
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
    return _.values(this.vertices);
  }

  /**
   * @returns {number} the number of vertices in the graph
   */
  numVertices() {
    return _.size(this.adj);
  }


  /**
   * @param {Edge} edge
   * @returns {Edge[]} all edges from the graph which are in-line with the input edge. (Ie, they
   *   have identical slopes, and x and y intercepts).
   */
  edgesInLineWith(edge) {
    const m = edge.getSlope();
    const b = edge.getIntercept();
    if (!_.has(this.collinearEdges, m)) return [];
    if (!_.has(this.collinearEdges[m], b)) return [];
    return this.collinearEdges[m][b];
  }


  getEdges() {
    const edgesSet = {};
    const edges = [];
    _.forEach(this.getVertices(), p1 => {
      _.forEach(this.adj[p1], p2 => {
        const e = new Edge(p1, p2);
        const edgeExists = _.has(edgesSet, new Edge(p2, p1));
        if (!edgeExists) {
          edges.push(e);
          edgesSet[e] = true;
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
