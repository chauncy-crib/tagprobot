import _ from 'lodash';
import { assert } from '../utils/asserts';


/**
 * Represents an x, y pixel location on the tagpro map. Used as vertices to define polygons.
 */
export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equal(other) {
    return this.x === other.x && this.y === other.y;
  }

  toString() {
    return `x: ${this.x}, y: ${this.y}`;
  }
}


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

  removeEdge(p1, p2) {
    this.adj[p1] = _.reject(this.adj[p1], p => p.equal(p2));
    this.adj[p2] = _.reject(this.adj[p2], p => p.equal(p1));
  }

  // User is responsible for clearing edges comming from vertex
  removeVertex(vertex) {
    delete this.adj[vertex];
    this.vertices = _.reject(this.vertices, v => vertex.equal(v));
  }

  isConnected(p1, p2) {
    const N = this.neighbors(p1);
    // Return true if any of p1's neighbors are equal to p2
    return _.some(_.map(N, n => n.equal(p2)));
  }

  /**
   * @returns {Point[]} the neighbors of the point
   */
  neighbors(p) {
    return this.adj[p];
  }

  addVertex(point) {
    // Only add vertex if it doesn't already exist in the graph
    if (!_.has(this.adj, point)) {
      this.adj[point] = [];
      this.vertices.push(point);
    }
  }

  /**
   * @returns {Point[]} all vertices in the graph
   */
  getVertices() {
    return this.vertices;
  }

  getEdges() {
    const edges = [];
    _.each(this.vertices, p1 => {
      _.each(this.adj[p1], p2 => {
        const edgeExists = _.some(edges, e => (
          (e.p1.equal(p1) && e.p2.equal(p2)) ||
          (e.p1.equal(p2) && e.p2.equal(p1))
        ));
        if (!edgeExists) {
          edges.push({ p1, p2 });
        }
      });
    });
    return edges;
  }
}
