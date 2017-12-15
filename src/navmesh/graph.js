import _ from 'lodash';
import { assert } from '../utils/asserts';
import { findUpperAndLowerPoints, threePointsInLine } from './graphUtils';

export function determinant(matrix) {
  const N = matrix.length;
  for (let i = 0; i < N; i += 1) {
    assert(matrix[i].length === N, 'input matrix should be NxN');
  }
  let sum = 0;
  // Recursive base-case, a single element
  if (N === 1) return matrix[0][0];
  for (let j = 0; j < N; j += 1) {
    // Create a sub-matrix which do not contain elements in the 0th row or the jth column
    const subMatrix = [];
    for (let k = 1; k < N; k += 1) {
      const row = [];
      for (let l = 0; l < N; l += 1) {
        if (l !== j) row.push(matrix[k][l]);
      }
      subMatrix.push(row);
    }
    // Alternate between +/- the determinant of the sub-matrix
    sum += ((j % 2) ? -1 : 1) * matrix[0][j] * determinant(subMatrix);
  }
  return sum;
}


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

  add(other) {
    const x = this.x + other.x;
    const y = this.y + other.y;
    return new Point(x, y);
  }

  times(scalar) {
    const x = this.x * scalar;
    const y = this.y * scalar;
    return new Point(x, y);
  }

  distance(other) {
    return Math.sqrt(this.distanceSquared(other));
  }

  distanceSquared(other) {
    const vector = this.subtract(other);
    return (vector.x ** 2) + (vector.y ** 2);
  }

  dot(other) {
    return (this.x * other.x) + (this.y * other.y);
  }

  toString() {
    return `x: ${this.x}, y: ${this.y}`;
  }
}

/**
 * @param {Point} A
 * @param {Point} B
 * @param {Point} P
 * @returns {number} a number which is positive iff P is on the left of the edge AB
 */
function detD(A, B, P) {
  return determinant([
    [A.x, A.y, 1],
    [B.x, B.y, 1],
    [P.x, P.y, 1],
  ]);
}

/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {{p1: Point, p2: Point}} e - an edge
 * @returns {boolean} if the two points are on the same side of the edge
 */
export function pointsOnSameSide(p1, p2, e) {
  return detD(e.p1, e.p2, p1) * detD(e.p1, e.p2, p2) > 0;
}

/**
 * @param {Triangle} t
 * @param {{p1: Point, p2: Point}} e - an edge
 * @returns {boolean} if the triangle intersects or touches the edge
 */
export function isTriangleIntersectingEdge(t, e) {
  const e1 = e.p1;
  const e2 = e.p2;
  const t1 = t.p1;
  const t2 = t.p2;
  const t3 = t.p3;

  // False if t1, t2, and t3 are all on same side of e
  if (pointsOnSameSide(t1, t2, e) && pointsOnSameSide(t2, t3, e)) return false;

  // False if e1 and e2 are both on other side of t1-t2 as t3
  const t12 = { p1: t1, p2: t2 }; // edge between t1 and t2
  if (!pointsOnSameSide(e1, t3, t12) && !pointsOnSameSide(e2, t3, t12)) return false;

  // False if e1 and e2 are both on other side of t2-t3 as t1
  const t23 = { p1: t2, p2: t3 }; // edge between t2 and t3
  if (!pointsOnSameSide(e1, t1, t23) && !pointsOnSameSide(e2, t1, t23)) return false;

  // False if e1 and e2 are both on other side of t3-t1 as t2
  const t31 = { p1: t3, p2: t1 }; // edge between t3 and t1
  if (!pointsOnSameSide(e1, t2, t31) && !pointsOnSameSide(e2, t2, t31)) return false;

  return true;
}


/**
 * Find the point in the center, and then return the points sorted counter clockwise around it,
 *   starting at 12 o'clock. Adapted from:
 *   https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
 * @param {Point[]} points
 * @returns {Point[]} the points sorted in counter clockwise order
 */
export function sortCounterClockwise(points) {
  const center = {
    x: _.sumBy(points, 'x') / points.length,
    y: _.sumBy(points, 'y') / points.length,
  };
  return points.sort((a, b) => {
    if (a.x - center.x >= 0 && b.x - center.x < 0) return true;
    if (a.x - center.x < 0 && b.x - center.x >= 0) return false;
    if (a.x - center.x === 0 && b.x - center.x === 0) {
      if (a.y - center.y >= 0 || b.y - center.y >= 0) return a.y > b.y;
      return b.y > a.y;
    }

    // Compute the cross product of vectors (center -> a) x (center -> b)
    const det = ((a.x - center.x) * (b.y - center.y)) - ((b.x - center.x) * (a.y - center.y));
    if (det < 0) return true;
    if (det > 0) return false;

    // Points a and b are on the same line from the center
    // Check which point is closer to the center
    const d1 = ((a.x - center.x) * (a.x - center.x)) + ((a.y - center.y) * (a.y - center.y));
    const d2 = ((b.x - center.x) * (b.x - center.x)) + ((b.y - center.y) * (b.y - center.y));
    return d1 > d2;
  });
}


/**
 * Checks if edge e is delaunay-legal with respect to the inserted point
 * @param {Point} insertedPoint - the point being added to the triangulation
 * @param {{p1: Point, p2: Point}} e - the edge we are checking for legality
 * @param {Point} oppositePoint - The third point of the adjacent triangle to e.p1, e.p2,
 *   insertedPoint
 * @returns {boolean} true if the opposite point is not inside the circle which touches e.p1, e.p2,
 *   insertedPoint
 */
export function isLegal(insertedPoint, e, oppositePoint) {
  const [A, B, C] = sortCounterClockwise([insertedPoint, e.p1, e.p2]);
  const D = oppositePoint;
  const matrix = [
    [A.x, A.y, (A.x ** 2) + (A.y ** 2), 1],
    [B.x, B.y, (B.x ** 2) + (B.y ** 2), 1],
    [C.x, C.y, (C.x ** 2) + (C.y ** 2), 1],
    [D.x, D.y, (D.x ** 2) + (D.y ** 2), 1],
  ];
  return determinant(matrix) <= 0;
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

  removeEdgeAndVertices(p1, p2) {
    this.removeEdge(p1, p2);
    if (this.neighbors(p1).length === 0) this.removeVertex(p1);
    if (this.neighbors(p2).length === 0) this.removeVertex(p2);
  }

  removeEdge(p1, p2) {
    this.adj[p1] = _.reject(this.adj[p1], p => p.equal(p2));
    this.adj[p2] = _.reject(this.adj[p2], p => p.equal(p1));
  }

  removeVertex(vertex) {
    // clear all edges attached to the vertex
    _.forEach(this.adj[vertex], a => {
      this.adj[a] = _.reject(this.adj[a], v => vertex.equal(v));
    });
    // remove the vertex
    delete this.adj[vertex];
    this.vertices = _.reject(this.vertices, v => vertex.equal(v));
  }

  isConnected(p1, p2) {
    if (!this.hasVertex(p1) || !this.hasVertex(p2)) return false;
    const N = this.neighbors(p1);
    // Return true if any of p1's neighbors are equal to p2
    return _.some(N, n => n.equal(p2));
  }

  copy() {
    const g = new Graph();
    _.forEach(this.getVertices(), v => {
      g.addVertex(v);
    });
    _.forEach(this.getEdges(), e => {
      g.addEdge(e.p1, e.p2);
    });
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
    if (_.has(this.adj, point)) return false;
    this.adj[point] = [];
    this.vertices.push(point);
    return true;
  }

  /**
   * @returns {Point[]} all vertices in the graph
   */
  getVertices() {
    return this.vertices;
  }

  /**
   * @returns {number} the number of vertices in the graph
   */
  numVertices() {
    return this.getVertices().length;
  }

  getEdges() {
    const edges = [];
    _.forEach(this.vertices, p1 => {
      _.forEach(this.adj[p1], p2 => {
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

  /**
   * @returns {number} the number of edges in the graph
   */
  numEdges() {
    return this.getEdges().length;
  }
}


/**
 * Same as a Point, but keeps a reference to its containing triangle for funneling.
 */
export class Polypoint extends Point {
  constructor(x, y, triangle) {
    super(x, y);
    this.t = triangle;
  }
}


export class Triangle {
  constructor(p1, p2, p3) {
    assert(
      !(p1.equal(p2) || p1.equal(p3) || p3.equal(p2)),
      'Tried to make triangle with two of the same points',
    );
    assert(
      !threePointsInLine(p1, p2, p3),
      'Tried to make a triangle with no area',
    );
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }

  /**
   * @returns {Polypoint} the center point of the triangle
   */
  getCenter() {
    return new Polypoint(
      Math.round((this.p1.x + this.p2.x + this.p3.x) / 3),
      Math.round((this.p1.y + this.p2.y + this.p3.y) / 3),
      this,
    );
  }

  getEdgeCenters() {
    return [
      new Point((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2),
      new Point((this.p2.x + this.p3.x) / 2, (this.p2.y + this.p3.y) / 2),
      new Point((this.p1.x + this.p3.x) / 2, (this.p1.y + this.p3.y) / 2),
    ];
  }

  getPoints() {
    return [this.p1, this.p2, this.p3];
  }

  /**
   * @param {Triangle} other
   * @returns {{shared: Point[], unique: Point[]}} shared contains all points which appear in both
   *   triangles, unique has all points contained in exactly one of the triangles
   */
  categorizePoints(other) {
    const shared = _.intersectionBy(this.getPoints(), other.getPoints(), p => p.toString());
    const allPoints = this.getPoints().concat(other.getPoints());
    const unique = _.reject(allPoints, p => _.some(shared, s => s.equal(p)));
    return { shared, unique };
  }

  equal(other) {
    const points1 = [this.p1, this.p2, this.p3];
    const points2 = [other.p1, other.p2, other.p3];
    // Return if p1 in points1 has some p2 in points2 where p2.equal(p1)
    return _.every(points1, p1 => _.some(points2, p2 => p2.equal(p1)));
  }

  hasPoint(p) {
    return p.equal(this.p1) || p.equal(this.p2) || p.equal(this.p3);
  }
}


/*
 * Extend the Graph class to represent the delaunay triangles. Contains triangle objects in addition
 * to edges and vertices
 */
export class TGraph extends Graph {
  constructor() {
    super();
    this.triangles = new Set();
    this.fixedAdj = {};
    this.polypoints = new Graph();
  }

  calculatePolypointGraph() {
    this.triangles.forEach(triangle => {
      // Add a polypoint in center of triangle
      const triangleCenter = triangle.getCenter();
      this.polypoints.addVertex(triangleCenter);
      _.forEach(this.getAdjacentTriangles(triangle), t => {
        const adjCenter = t.getCenter();
        this.polypoints.addVertex(adjCenter);
        this.polypoints.addEdge(triangleCenter, adjCenter);
      });
    });
  }

  getAdjacentTriangles(t) {
    const res = [];
    const op1 = this.findOppositePoint(t.p1, { p1: t.p2, p2: t.p3 });
    const op2 = this.findOppositePoint(t.p2, { p1: t.p1, p2: t.p3 });
    const op3 = this.findOppositePoint(t.p3, { p1: t.p1, p2: t.p2 });
    if (op3) res.push(this.findTriangle(t.p1, t.p2, op3));
    if (op2) res.push(this.findTriangle(t.p1, t.p3, op2));
    if (op1) res.push(this.findTriangle(t.p2, t.p3, op1));
    return res;
  }

  /**
   * @param {Point} p
   * @returns {Triangle[]} all triangles in the triangulation containing the point
   */
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
    this.addEdgeAndVertices(t.p1, t.p2);
    this.addEdgeAndVertices(t.p1, t.p3);
    this.addEdgeAndVertices(t.p2, t.p3);
  }

  /**
   * @param {Point} p1
   * @param {Point} p2
   * @param {Point} p3
   * @returns {Triangle} a reference to the triangle which has the same location as the three input
   *   points
   */
  findTriangle(p1, p2, p3) {
    const r = new Triangle(p1, p2, p3);
    let res = null;
    this.triangles.forEach(t => {
      if (r.equal(t)) res = t;
    });
    return res;
  }

  /**
   * Remove all triangles and the associated edges connected to a point
   */
  removeVertexAndTriangles(p) {
    this.triangles.forEach(t => {
      // remove all triangles connected to the point
      if (t.p1.equal(p) || t.p2.equal(p) || t.p3.equal(p)) {
        this.removeTriangleByReference(t);
        // add back the edges we just removed
        if (t.p1.equal(p)) this.addEdge(t.p2, t.p3);
        if (t.p2.equal(p)) this.addEdge(t.p1, t.p3);
        if (t.p3.equal(p)) this.addEdge(t.p1, t.p2);
      }
    });
    this.removeVertex(p);
  }

  removeTriangleByPoints(p1, p2, p3) {
    const r = this.findTriangle(p1, p2, p3);
    if (r) this.removeTriangleByReference(r);
  }

  removeTriangleByReference(t) {
    this.triangles.delete(t);
    this.removeEdge(t.p1, t.p2);
    this.removeEdge(t.p1, t.p3);
    this.removeEdge(t.p2, t.p3);
  }

  /**
   * Overrides the super class function to initialize point in the fixedAdj
   */
  addVertex(point) {
    if (super.addVertex(point)) this.fixedAdj[point] = [];
  }

  addFixedEdge(e) {
    super.addEdge(e.p1, e.p2);
    this.fixedAdj[e.p1].push(e.p2);
    this.fixedAdj[e.p2].push(e.p1);
  }

  isEdgeFixed(e) {
    assert(this.isConnected(e.p1, e.p2), `${JSON.stringify(e)} is not a connected edge`);
    const fixedNeighbors = this.fixedAdj[e.p1];
    // Return true if any of p1's fixedNeighbors are equal to p2
    return _.some(fixedNeighbors, n => n.equal(e.p2));
  }

  /**
   * @param {Point} p
   * @param {{p1: Point, p2: Point}} e - an edge
   * @returns {Point|null} the point on the other side of edge e with respect to p, or null if the
   *   edge is fixed or is on the edge of the whole graph
   */
  findOppositePoint(p, e) {
    assert(this.isConnected(p, e.p1), `${p} was not connected to p1 of edge: ${e.p1}`);
    assert(this.isConnected(p, e.p2), `${p} was not connected to p2 of edge: ${e.p2}`);

    // No opposite point to a fixed edge
    if (this.isEdgeFixed(e)) return null;

    const n1 = this.neighbors(e.p1);
    const n2 = this.neighbors(e.p2);
    const sharedPoints = _.intersectionBy(n1, n2, point => point.toString());
    const oppositePoint = _.filter(sharedPoints, point => (
      // Point forms a triangle with the edge and is not the inserted point
      this.findTriangle(point, e.p1, e.p2) && !point.equal(p)
    ));
    assert(
      oppositePoint.length <= 1,
      `Found ${oppositePoint.length} opposite points to ${JSON.stringify(e)} from ${p} and they are
      ${oppositePoint}`,
    );
    return _.isEmpty(oppositePoint) ? null : oppositePoint[0];
  }

  /**
   * If the edge e is not delaunay-legal, flip it, and recursively legalize the resulting triangles
   */
  legalizeEdge(insertedPoint, e) {
    const oppositePoint = this.findOppositePoint(insertedPoint, e);
    if (oppositePoint && !isLegal(insertedPoint, e, oppositePoint)) {
      this.removeTriangleByPoints(e.p1, e.p2, insertedPoint);
      this.removeTriangleByPoints(e.p1, e.p2, oppositePoint);
      this.addTriangle(new Triangle(insertedPoint, oppositePoint, e.p1));
      this.addTriangle(new Triangle(insertedPoint, oppositePoint, e.p2));
      this.legalizeEdge(insertedPoint, { p1: e.p1, p2: oppositePoint });
      this.legalizeEdge(insertedPoint, { p1: e.p2, p2: oppositePoint });
    }
  }

  /**
   * Adds the point to the triangulation. Ensures the triangulation is delaunay-legal after
   *   insertion
   */
  addTriangulationVertex(p) {
    const containingTriangles = this.findContainingTriangles(p);
    assert(
      containingTriangles.length > 0 && containingTriangles.length <= 2,
      `Found ${containingTriangles.length} containing triangles`,
    );
    if (containingTriangles.length === 1) {
      // Point is inside one triangle
      const ct = containingTriangles[0];
      this.removeTriangleByReference(ct);
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
      assert(cp.shared.length > 1, `cp.shared length was ${cp.shared.length}`);
      assert(cp.unique.length > 1, `cp.unique length was ${cp.unique.length}`);
      this.removeTriangleByReference(ct1);
      this.removeTriangleByReference(ct2);
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

  /**
   * Recursively triangulates an un-triangulated region of points
   * @param {Point[]} reg - the region defined by an array of points connected in a cycle
   */
  triangulateRegion(reg) {
    // Base cases: make triangle if region is 3 points, skip if region is <3 points
    if (reg.length === 3) this.addTriangle(new Triangle(reg[0], reg[1], reg[2]));
    if (reg.length <= 3) return;

    // Extract out the points on the edge
    const e = { p1: reg[0], p2: _.last(reg) };
    assert(this.isConnected(e.p1, e.p2), `the edge of region ${reg} was not connected`);
    // Slice off the first and last element to get the inner region
    const innerReg = _.slice(reg, 1, -1);

    // Find vertex c on the region that triangle [e1, e2, c] is delaunay-legal with all other
    //   points in the region
    const cIndex = _.findIndex(innerReg, p => {
      const otherPoints = _.reject(innerReg, p);
      // Must be delaunay-legal with respect to every other point
      return _.every(otherPoints, other => isLegal(p, e, other));
    });

    // Make that triangle with vertex c
    this.addTriangle(new Triangle(e.p1, innerReg[cIndex], e.p2));

    // Call this recursively on the two sub-regions split by this triangle
    this.triangulateRegion(_.concat(e.p1, _.slice(innerReg, 0, cIndex + 1)));
    this.triangulateRegion(_.concat(_.slice(innerReg, cIndex, innerReg.length), e.p2));
  }

  /**
   * Adds an edge to the graph as a constrained edge and re-triangulates the affected surrounding
   *   region
   * @param {{p1: Point, p2: Point}} e - the edge to add
   */
  addConstraintEdge(e) {
    // If edge already exists, just make it fixed since everything is already triangulated
    if (this.isConnected(e.p1, e.p2)) {
      this.addFixedEdge(e);
      return;
    }

    // Find all triangles intersecting the edge
    const intersectingTriangles = _.filter(Array.from(this.triangles), t => (
      isTriangleIntersectingEdge(t, e)
    ));

    const { upperPoints, lowerPoints } = findUpperAndLowerPoints(intersectingTriangles, e);

    // Remove all intersecting triangles
    _.forEach(intersectingTriangles, t => this.removeTriangleByReference(t));

    // Add the fixed edge to the graph
    this.addFixedEdge(e);

    // Re-triangulate the upper and lower regions
    this.triangulateRegion(upperPoints);
    this.triangulateRegion(lowerPoints);
  }
}

