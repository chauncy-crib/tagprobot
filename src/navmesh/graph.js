import _ from 'lodash';

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
 * Represents the polygons of traversable space as a graph, with vertices and edges surrounding the
 * traversable-space.
 */
export class Graph {
  constructor() {
    this.vertices = [];
    this.edges = [];
  }

  addEdge(point1, point2) {
    if (this.isConnected(point1, point2)) {
      return;
    }
    this.edges.push({ point1, point2 });
  }

  removeEdge(point1, point2) {
    this.edges = _.reject(this.edges, e => (
      // Remove edges between the two points
      (e.point1.equal(point1) && e.point2.equal(point2)) ||
      (e.point1.equal(point2) && e.point2.equal(point1))
    ));
  }

  // User is responsible for clearing edges comming from vertex
  removeVertex(vertex) {
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
    const res = [];
    for (let i = 0; i < this.edges.length; i += 1) {
      const e = this.edges[i];
      if (e.point1.equal(p)) {
        res.push(e.point2);
      } else if (e.point2.equal(p)) {
        res.push(e.point1);
      }
    }
    return res;
  }

  addVertex(point) {
    // Only add vertex if it doesn't already exist in the graph
    if (!_.some(_.map(this.getVertices(), v => v.equal(point)))) {
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
    return this.edges;
  }
}
