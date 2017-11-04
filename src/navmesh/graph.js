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


export function isLegal(insertedPoint, e, oppositePoint) {
  // TODO: do this with a matrix determinant per wiki article
  // Assign p1, p2, p3 such that the slopes of the lines p1p2 and p2p3 are not infinite
  let p1;
  let p2;
  let p3;
  if (e.p2.x === e.p1.x) {
    p1 = e.p1;
    p2 = insertedPoint;
    p3 = e.p2;
  } else if (insertedPoint.x === e.p2.x) {
    p1 = e.p2;
    p2 = e.p1;
    p3 = insertedPoint;
  } else {
    p1 = e.p1;
    p2 = e.p2;
    p3 = insertedPoint;
  }
  assert(
    p2.x !== p1.x && p2.x !== p3.x,
    'Drawing a line between two points resulted in an infinite slope',
  );
  const ma = (p2.y - p1.y) / (p2.x - p1.x);
  const mb = (p3.y - p2.y) / (p3.x - p2.x);
  assert(ma !== mb, `Lines had parallel slope: ${ma}`);
  const centerX = (
    (ma * mb * (p1.y - p3.y)) + (mb * (p1.x + p2.x)) + (-ma * (p2.x + p3.x))) /
    (2 * (mb - ma)
    );
  let centerY;
  if (ma !== 0) { // if line A has a non-horizantal slope, use it to calculate centerY
    centerY = ((-1 / ma) * (centerX - ((p1.x + p2.x) / 2))) + ((p1.y + p2.y) / 2);
  } else { // otherwise, use line B
    centerY = ((-1 / mb) * (centerX - ((p2.x + p3.x) / 2))) + ((p2.y + p3.y) / 2);
  }
  const centerPoint = new Point(centerX, centerY);
  const radiusSquared = centerPoint.distanceSquared(p1);
  return centerPoint.distanceSquared(oppositePoint) >= radiusSquared;
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
    assert(!_.isNil(point), 'Point was undefined');
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
    const allPoints = [this.p1, this.p2, this.p3, other.p1, other.p2, other.p3];
    const uniqueIdx = [true, true, true, true, true, true]; // assume all unique
    const sharedIdx = [false, false, false, false, false, false];
    for (let i = 0; i < 3; i += 1) {
      for (let j = 3; j < 6; j += 1) {
        if (allPoints[i].equal(allPoints[j])) {
          uniqueIdx[i] = false;
          uniqueIdx[j] = false;
          sharedIdx[i] = true;
          break;
        }
      }
    }
    const shared = [];
    const unique = [];
    for (let i = 0; i < 6; i += 1) {
      if (uniqueIdx[i]) unique.push(allPoints[i]);
      if (sharedIdx[i]) shared.push(allPoints[i]);
    }
    return { shared, unique };
  }

  equal(other) {
    const points1 = [this.p1, this.p2, this.p3];
    const points2 = [other.p1, other.p2, other.p3];
    // Return if p1 in points1 has some p2 in points2 where p2.equal(p1)
    return _.every(points1, p1 => _.some(points2, p2 => p2.equal(p1)));
  }
}


export class TGraph extends Graph {
  constructor() {
    super();
    this.triangles = new Set();
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
    this.addEdgeAndVertices(t.p1, t.p2);
    this.addEdgeAndVertices(t.p1, t.p3);
    this.addEdgeAndVertices(t.p2, t.p3);
  }

  findTriangle(p1, p2, p3) {
    const r = new Triangle(p1, p2, p3);
    let res = null;
    this.triangles.forEach(t => {
      if (r.equal(t)) res = t;
    });
    return res;
  }

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

  findOppositePoint(p, e) {
    assert(this.isConnected(p, e.p1), `${p} was not connected to p1 of edge: ${e.p1}`);
    assert(this.isConnected(p, e.p2), `${p} was not connected to p2 of edge: ${e.p2}`);
    const n1 = this.neighbors(e.p1);
    const n2 = this.neighbors(e.p2);
    const sharedPoints = _.intersectionBy(n1, n2, point => point.toString());
    const oppositePoint = _.filter(sharedPoints, point => (
      // Point forms a triangle with the edge and is not the inserted point
      this.findTriangle(point, e.p1, e.p2) && !point.equal(p)
    ));
    assert(
      oppositePoint.length <= 1,
      `Found ${oppositePoint.length} opposite points to ${e.p1} and ${e.p2}`,
    );
    return _.isEmpty(oppositePoint) ? null : oppositePoint[0];
  }

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
}
