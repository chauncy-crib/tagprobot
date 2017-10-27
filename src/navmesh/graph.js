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

  addEdge(point1, point2) {
    assert(_.has(this.adj, point1), `${point1} not initialized in the graph with addVertex()`);
    assert(_.has(this.adj, point2), `${point2} not initialized in the graph with addVertex()`);
    if (this.isConnected(point1, point2)) {
      return;
    }
    this.adj[point1].push(point2);
    this.adj[point2].push(point1);
  }

  addEdgeAndVertices(point1, point2) {
    this.addVertex(point1);
    this.addVertex(point2);
    this.addEdge(point1, point2);
  }

  removeEdge(point1, point2) {
    this.adj[point1] = _.reject(this.adj[point1], p => p.equal(point2));
    this.adj[point2] = _.reject(this.adj[point2], p => p.equal(point1));
  }

  // User is responsible for clearing edges comming from vertex
  removeVertex(vertex) {
    delete this.adj[vertex];
    this.vertices = _.reject(this.vertices, v => vertex.equal(v));
  }

  isConnected(point1, point2) {
    const N = this.neighbors(point1);
    // Return true if any of point1's neighbors are equal to point2
    return _.some(_.map(N, n => n.equal(point2)));
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
          (e.point1.equal(p1) && e.point2.equal(p2)) ||
          (e.point1.equal(p2) && e.point2.equal(p1))
        ));
        if (!edgeExists) {
          edges.push({ point1: p1, point2: p2 });
        }
      });
    });
    return edges;
  }
}
