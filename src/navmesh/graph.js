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

  subtract(other) {
    const x = this.x - other.x;
    const y = this.y - other.y;
    return new Point(x, y);
  }

  dot(other) {
    return (this.x * other.x) + (this.y * other.y);
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


export class Triangle {
  constructor(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }

  getPoints() {
    return new Set([this.p1, this.p2, this.p3]);
  }

  categorizePoints(other) {
    const shared = [];
    const unique = [];
    const thesePoints = this.getPoints();
    const thosePoints = other.getPoints();
    thesePoints.forEach(thisPoint => {
      if (thosePoints.has(thisPoint)) {
        shared.push(thisPoint);
        thosePoints.delete(thisPoint);
      } else {
        unique.push(thisPoint);
      }
    });
    unique.concat(Array.from(thosePoints));
    return { shared, unique };
  }
}


export class TGraph extends Graph {
  constructor() {
    super();
    this.triangles = new Set();
    this.edgeToTriangles = {};
  }

  findContainingTriangles(p) {
    const containingTriangles = [];
    this.triangles.forEach(t => {
      // Compute vectors
      const v0 = t.p3.subtract(t.p1);
      const v1 = t.p2.subtract(t.p1);
      const v2 = p.subtract(t.p1);

      // Compute dot products
      const dot00 = v0.dot(v0);
      const dot01 = v0.dot(v1);
      const dot02 = v0.dot(v2);
      const dot11 = v1.dot(v1);
      const dot12 = v1.dot(v2);

      // Compute barycentric coordinates
      const invDenom = 1 / ((dot00 * dot11) - (dot01 * dot01));
      const u = ((dot11 * dot02) - (dot01 * dot12)) * invDenom;
      const v = ((dot00 * dot12) - (dot01 * dot02)) * invDenom;

      // Check if point is inside or on edge of triangle
      if ((u >= 0) && (v >= 0) && (u + v <= 1)) {
        containingTriangles.push(t);
      }
    });
    return containingTriangles;
  }

  addTriangle(t) {
    this.triangles.add(t);
    this.addEdge(t.p1, t.p2);
    this.addEdge(t.p1, t.p3);
    this.addEdge(t.p2, t.p3);
    this.edgeToTriangle[`${t.p1},${t.p2}`] = this.edgeToTriangle[`${t.p1},${t.p2}`] || [];
    this.edgeToTriangle[''].push(t);
  }

  removeTriangle(t) {
    this.triangles.delete(t);
    this.removeEdge(t.p1, t.p2);
    this.removeEdge(t.p1, t.p3);
    this.removeEdge(t.p2, t.p3);
  }

  isLegal(e) {
    return true;
  }

  legalizeEdge(p, e, oppositePoint) {
    if (!this.isLegal(e)) {
      this.removeTriangle();
      this.legalizeEdge(p, { p1: e.p1, p2: oppositePoint });
      this.legalizeEdge(p, { p1: e.p2, p2: oppositePoint });
    }
  }

  addVertex(p) {
    const containingTriangles = this.findContainingTriangles(p);
    console.info(containingTriangles);
    if (containingTriangles.length === 1) {
      // Point is inside one triangle
      const ct = containingTriangles[0];
      this.removeTriangle(ct);
      this.addTriangle(new Triangle(ct.p1, ct.p2, p));
      this.addTriangle(new Triangle(ct.p1, p, ct.p3));
      this.addTriangle(new Triangle(p, ct.p2, ct.p3));
      this.legalizeEdge(p, { p1: ct.p1, p2: ct.p2 });
      this.legalizeEdge(p, { p1: ct.p1, p2: ct.p3 });
      this.legalizeEdge(p, { p1: ct.p2, p2: ct.p3 });
    } else if (containingTriangles.length === 2) {
      // Point lies on a line
      const ct1 = containingTriangles[0];
      const ct2 = containingTriangles[1];
      const cp = ct1.categorizePoints(ct2); // categorized points
      this.removeTriangle(ct1);
      this.removeTriangle(ct2);
      this.addTriangle(new Triangle(cp.shared[0], cp.unique[0], p));
      this.addTriangle(new Triangle(cp.shared[0], cp.unique[1], p));
      this.addTriangle(new Triangle(cp.shared[1], cp.unique[0], p));
      this.addTriangle(new Triangle(cp.shared[1], cp.unique[1], p));
      this.legalizeEdge(p, { p1: cp.shared[0], p2: cp.unique[0] });
      this.legalizeEdge(p, { p1: cp.shared[0], p2: cp.unique[1] });
      this.legalizeEdge(p, { p1: cp.shared[1], p2: cp.unique[0] });
      this.legalizeEdge(p, { p1: cp.shared[1], p2: cp.unique[1] });
    }
  }
}
