import _ from 'lodash';

import { assert } from '../../global/utils';
import { TriangleTreeNode } from './TriangleTreeNode';
import {
  detD,
  detH,
  sortCounterClockwise,
  findUpperAndLowerPoints,
} from '../utils';
import { Point } from './Point';
import { Edge } from './Edge';
import { Triangle } from './Triangle';
import { DrawableGraph } from '../../draw/class/DrawableGraph';
import { isLegal } from '../graphToTriangulation';
import { COLORS, ALPHAS, THICKNESSES } from '../../draw/constants';

let legalizeCount1 = 0;
let legalizeCount2 = 0;

const CLEARANCE = 27; // sqrt(BRP^2 + BRP^2) to have full clearance around a right-angle corner


/*
 * Extend the Graph class to represent the delaunay triangles. Contains triangle objects in addition
 * to edges and vertices
 */
export class TriangleGraph extends DrawableGraph {
  constructor() {
    super(
      THICKNESSES.triangulation,
      ALPHAS.triangulation.vertex,
      COLORS.triangulation.vertex,
      e => (
        this.isEdgeFixed(e) ?
          {
            color: COLORS.triangulation.fixedEdge,
            alpha: ALPHAS.triangulation.fixedEdge,
            thickness: THICKNESSES.triangulation,
          } :
          {
            color: COLORS.triangulation.edge,
            alpha: ALPHAS.triangulation.edge,
            thickness: THICKNESSES.triangulation,
          }
      ),
    );
    this.initDataStructures();
  }


  initDataStructures() {
    this.rootNode = null;
    this.triangles = new Set();
    this.fixedAdj = {};
    this.polypoints = new DrawableGraph(
      THICKNESSES.triangulation,
      ALPHAS.polypoints.vertex,
      COLORS.polypoints.edge,
      () => ({
        color: COLORS.polypoints.edge,
        alpha: ALPHAS.polypoints.edge,
        thickness: THICKNESSES.triangulation,
      }),
    );
  }


  clear() {
    super.clear();
    this.initDataStructures();
  }

  numTriangles() {
    return this.rootNode.findAllTriangles().length;
  }


  getAdjacentTriangles(t) {
    const res = [];
    const op1 = this.findOppositePoint(t.p1, new Edge(t.p2, t.p3));
    const op2 = this.findOppositePoint(t.p2, new Edge(t.p1, t.p3));
    const op3 = this.findOppositePoint(t.p3, new Edge(t.p1, t.p2));
    if (op3) res.push(this.findTriangle(t.p1, t.p2, op3));
    if (op2) res.push(this.findTriangle(t.p1, t.p3, op2));
    if (op1) res.push(this.findTriangle(t.p2, t.p3, op1));
    assert(!_.some(res, _.isNull), 'One triangle was null');
    return res;
  }


  /**
   * @param {Point} p
   * @returns {Triangle[]} all triangles in the triangulation containing the point
   */
  findContainingTriangles(p) {
    const containingTriangles = [];
    this.triangles.forEach(t => {
      if (t.containsPoint(p)) containingTriangles.push(t);
    });
    return containingTriangles;
  }


  addTriangle(t, updateNode = false) {
    if (this.numVertices() === 0 && updateNode) {
      this.rootNode = new TriangleTreeNode(t);
    }
    this.triangles.add(t);
    this.addEdgeAndVertices(new Edge(t.p1, t.p2));
    this.addEdgeAndVertices(new Edge(t.p1, t.p3));
    this.addEdgeAndVertices(new Edge(t.p2, t.p3));
    this.polypoints.addVertex(t.getCenter());
    _.forEach(this.getAdjacentTriangles(t), adjT => {
      const adjCenter = adjT.getCenter();
      this.polypoints.addEdge(new Edge(t.getCenter(), adjCenter));
    });
  }


  /**
   * @param {Point} p1
   * @param {Point} p2
   * @param {Point} p3
   * @returns {Triangle} a reference to the triangle which has the same location as the three input
   *   points
   */
  findTriangle(p1, p2, p3) {
    const r = new Triangle(p1, p2, p3, false);
    let res = null;
    this.triangles.forEach(t => {
      if (r.equals(t)) res = t;
    });
    return res;
  }


  /**
   * Remove all triangles and the associated edges connected to a point
   */
  removeVertexAndTriangles(p) {
    this.triangles.forEach(t => {
      // remove all triangles connected to the point
      if (t.p1.equals(p) || t.p2.equals(p) || t.p3.equals(p)) {
        this.removeTriangleByReference(t);
        // add back the edges we just removed
        if (t.p1.equals(p)) this.addEdge(new Edge(t.p2, t.p3));
        if (t.p2.equals(p)) this.addEdge(new Edge(t.p1, t.p3));
        if (t.p3.equals(p)) this.addEdge(new Edge(t.p1, t.p2));
      }
    });
    this.removeVertex(p);
  }


  removeTriangleByPoints(p1, p2, p3) {
    const r = this.findTriangle(p1, p2, p3);
    if (r) this.removeTriangleByReference(r);
  }


  removeTriangleByReference(t) {
    if (this.polypoints.hasVertex(t.getCenter())) {
      this.polypoints.removeVertex(t.getCenter());
    }
    this.triangles.delete(t);
    this.removeEdge(new Edge(t.p1, t.p2));
    this.removeEdge(new Edge(t.p1, t.p3));
    this.removeEdge(new Edge(t.p2, t.p3));
  }


  /**
   * Overrides the super class function to initialize point in the fixedAdj
   */
  addVertex(point) {
    if (!super.addVertex(point)) return false;
    this.fixedAdj[point] = [];
    return true;
  }


  addFixedEdge(e) {
    this.fixedAdj[e.p1].push(e.p2);
    this.fixedAdj[e.p2].push(e.p1);
    if (this.isConnected(e.p1, e.p2)) {
      this.removeDrawing(e);
      this.addEdgeDrawing(e);
    }
    this.addEdge(e);
  }


  isEdgeFixed(e) {
    assert(this.isConnected(e.p1, e.p2), `${JSON.stringify(e)} is not a connected edge`);
    const fixedNeighbors = this.fixedAdj[e.p1];
    // Return true if any of p1's fixedNeighbors are equal to p2
    return _.some(fixedNeighbors, n => n.equals(e.p2));
  }


  getFixedNeighbors(p) {
    return this.fixedAdj[p];
  }


  /**
   * @param {Point} cornerPoint - the point on the corner that needs clearance
   * @returns {Point} a point that is CLEARANCE away from the cornerPoint in the corner's normal
   *   direction
   */
  getClearancePoint(cornerPoint) {
    const neighbors = this.getFixedNeighbors(cornerPoint);

    // Don't get clearance if this is a concave corner with an odd number of neighbors
    if (neighbors.length !== 2) return cornerPoint.copy();

    const [prevPoint, nextPoint] = neighbors;

    const nextAngle = Math.atan2(
      nextPoint.y - cornerPoint.y,
      nextPoint.x - cornerPoint.x,
    );
    const prevAngle = Math.atan2(
      prevPoint.y - cornerPoint.y,
      prevPoint.x - cornerPoint.x,
    );

    // Minimum distance between angles
    let distance = nextAngle - prevAngle;
    if (Math.abs(distance) > Math.PI) distance -= Math.PI * (distance > 0 ? 2 : -2);

    // Calculate perpendicular to average angle
    const angle = prevAngle + (distance / 2) + (Math.PI);

    const normal = new Point(Math.cos(angle), Math.sin(angle));

    // Return new point with clearance from the corner
    return cornerPoint.add(normal.times(CLEARANCE));
  }
  /**
   * @param {Edge} e
   * @returns {Triangle[]} all triangles which have one edge equal to e
   */
  findTrianglesWithEdge(e) {
    return _.filter(Array.from(this.triangles), t => t.hasEdge(e));
  }

  /**
   * @param {Point} p
   * @param {Edge} e
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
      this.findTriangle(point, e.p1, e.p2) && !point.equals(p)
    ));
    assert(
      oppositePoint.length <= 1,
      `Found ${oppositePoint.length} opposite points to ${JSON.stringify(e)} from ${p} and they are
      ${oppositePoint}`,
    );
    return _.isEmpty(oppositePoint) ? null : oppositePoint[0];
  }


  /**
   * If the edge is not delaunay-legal, flip it, and recursively legalize the resulting triangles
   */
  legalizeEdge(insertedPoint, edge) {
    legalizeCount1 += 1;
    const oppositePoint = this.findOppositePoint(insertedPoint, edge);
    if (oppositePoint && !isLegal(insertedPoint, edge, oppositePoint)) {
      this.removeTriangleByPoints(edge.p1, edge.p2, insertedPoint);
      this.removeTriangleByPoints(edge.p1, edge.p2, oppositePoint);
      this.addTriangle(new Triangle(insertedPoint, oppositePoint, edge.p1));
      this.addTriangle(new Triangle(insertedPoint, oppositePoint, edge.p2));
      this.legalizeEdge(insertedPoint, new Edge(edge.p1, oppositePoint));
      this.legalizeEdge(insertedPoint, new Edge(edge.p2, oppositePoint));
    }
  }

  /**
   * @param {TriangleTreeNode} node
   * @param {Point} newPoint
   */
  legalizeEdgeNode(node, newPoint) {
    legalizeCount2 += 1;
    const edgeBetween = node.triangle.getEdgeWithoutPoint(newPoint);
    if (this.isEdgeFixed(edgeBetween)) return;
    const otherNode = this.rootNode.findNodeAcross(node.triangle, edgeBetween);
    if (otherNode) {
      const oppositePoint = otherNode.triangle.getPointNotOnEdge(edgeBetween);
      if (!isLegal(newPoint, edgeBetween, oppositePoint)) {
        const t1 = new Triangle(newPoint, oppositePoint, edgeBetween.p1);
        const t2 = new Triangle(newPoint, oppositePoint, edgeBetween.p2);
        const n1 = new TriangleTreeNode(t1);
        const n2 = new TriangleTreeNode(t2);
        node.addChild(n1);
        node.addChild(n2);
        otherNode.addChild(n1);
        otherNode.addChild(n2);
        this.legalizeEdgeNode(n1, newPoint);
        this.legalizeEdgeNode(n2, newPoint);
      }
    }
  }


  /**
   * Adds the point to the triangulation. Ensures the triangulation is delaunay-legal after
   *   insertion
   */
  delaunayAddVertex(p, updateNode = false) {
    assert(!this.hasVertex(p));
    let nodeNews;
    if (updateNode) {
      const temp = this.rootNode.addVertex(p);
      nodeNews = temp.newNodes;
      _.forEach(nodeNews, n => this.legalizeEdgeNode(n, p));
    }
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
      this.legalizeEdge(p, new Edge(ct.p1, ct.p2));
      this.legalizeEdge(p, new Edge(ct.p1, ct.p3));
      this.legalizeEdge(p, new Edge(ct.p2, ct.p3));
      if (updateNode) assert(nodeNews.length === 3, `nodeNews was length ${nodeNews.length}`);
    } else if (containingTriangles.length === 2) {
      // Point lies on a line
      const ct1 = containingTriangles[0];
      const ct2 = containingTriangles[1];
      const cp = ct1.categorizePoints(ct2); // categorized points
      assert(cp.shared.length === 2, `cp.shared length was ${cp.shared.length}`);
      this.removeTriangleByReference(ct1);
      this.removeTriangleByReference(ct2);
      this.addTriangle(new Triangle(cp.shared[0], cp.myPoint, p));
      this.addTriangle(new Triangle(cp.shared[0], cp.otherPoint, p));
      this.addTriangle(new Triangle(cp.shared[1], cp.myPoint, p));
      this.addTriangle(new Triangle(cp.shared[1], cp.otherPoint, p));
      this.legalizeEdge(p, new Edge(cp.shared[0], cp.myPoint));
      this.legalizeEdge(p, new Edge(cp.shared[0], cp.otherPoint));
      this.legalizeEdge(p, new Edge(cp.shared[1], cp.myPoint));
      this.legalizeEdge(p, new Edge(cp.shared[1], cp.otherPoint));
      if (updateNode) assert(nodeNews.length === 4, `nodeNews was length ${nodeNews.length}`);
    }
    if (updateNode) {
      assert(
        legalizeCount1 === legalizeCount2,
        `Node was legalized ${legalizeCount2}, should be ${legalizeCount1}`,
      );
    }
  }


  /**
   * Recursively triangulates an un-triangulated region of points
   * @param {Point[]} reg - the region defined by an array of points connected in a cycle
   * @returns {number} - the number of times the function was called recursively
   */
  triangulateRegion(reg) {
    // Base cases: make triangle if region is 3 points, skip if region is <3 points
    if (reg.length === 3) this.addTriangle(new Triangle(reg[0], reg[1], reg[2]));
    if (reg.length <= 3) return 1;

    // Extract out the points on the edge
    const e = new Edge(reg[0], _.last(reg));
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

    let callCount = 1;

    // Call this recursively on the two sub-regions split by this triangle
    callCount += this.triangulateRegion(_.concat(e.p1, _.slice(innerReg, 0, cIndex + 1)));
    callCount += this.triangulateRegion(_.concat(_.slice(innerReg, cIndex, innerReg.length), e.p2));
    return callCount;
  }


  /**
   * Adds an edge to the graph as a constrained edge and re-triangulates the affected surrounding
   *   region
   * @param {Edge} e - the edge to add
   */
  delaunayAddConstraintEdge(e, updateNode = false) {
    const trianglesAcross = this.findTrianglesWithEdge(e);
    if (trianglesAcross.length === 2) {
      this.polypoints.removeEdge(new Edge(
        trianglesAcross[0].getCenter(),
        trianglesAcross[1].getCenter(),
      ));
    }
    // If edge already exists, just make it fixed since everything is already triangulated
    if (this.isConnected(e.p1, e.p2)) {
      this.addFixedEdge(e);
      return;
    }

    let upperCount;
    let lowerCount;

    if (updateNode) {
      const intersectingNodes = this.rootNode.findNodesIntersectingEdge(e);
      const { upperPoints, lowerPoints, orderedNodes } = TriangleTreeNode.findUpperAndLowerPoints(
        intersectingNodes,
        e,
      );
      upperCount = TriangleTreeNode.triangulateRegion(upperPoints, orderedNodes);
      lowerCount = TriangleTreeNode.triangulateRegion(lowerPoints, orderedNodes);
    }

    // Find all triangles intersecting the edge
    const intersectingTriangles = _.filter(Array.from(this.triangles), t => (
      t.intersectsEdge(e)
    ));

    const { upperPoints, lowerPoints } = findUpperAndLowerPoints(intersectingTriangles, e);

    // Remove all intersecting triangles
    _.forEach(intersectingTriangles, t => this.removeTriangleByReference(t));

    // Add the fixed edge to the graph
    this.addFixedEdge(e);

    // Re-triangulate the upper and lower regions
    const uc = this.triangulateRegion(upperPoints);
    const lc = this.triangulateRegion(lowerPoints);
    if (updateNode) {
      assert(this.numTriangles() === this.rootNode.findAllTriangles().length);
      assert(uc === upperCount);
      assert(lc === lowerCount);
    }
  }


  getFixedEdges() {
    const edgesSet = {};
    const edges = [];
    _.forEach(this.getVertices(), p1 => {
      _.forEach(this.fixedAdj[p1], p2 => {
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


  numFixedEdges() {
    return this.getFixedEdges().length;
  }


  /**
   * @param {Point} p the point to remove from the triangulation graph and validly triangulate
   *   around.
   */
  delaunayRemoveVertex(p, updateNode = false) {
    if (updateNode) {
      this.rootNode.removeVertex(p, this.neighbors(p));
    }
    const N = sortCounterClockwise(this.neighbors(p), p);
    for (let i = 0; i < N.length; i++) {
      const n1 = N[i ? i - 1 : N.length - 1];
      const n2 = N[i];
      assert(this.isConnected(n1, n2), `Cycle not formed by neighbors around ${p}`);
    }
    while (this.neighbors(p).length > 3) {
      let ear = null;
      const neighbors = sortCounterClockwise(this.neighbors(p), p);
      const L = neighbors.length;
      // Find an ear to remove, iterate until you find an ear
      let i = 0;
      while (!ear && i < L) {
        const v1 = neighbors[i];
        const v2 = neighbors[(i + 1) % L];
        const v3 = neighbors[(i + 2) % L];
        if (detD(v1, v2, v3) >= 0 && detD(v1, v3, p) >= 0) {
          // Neighbors not in this triple
          const otherNbrs = _.reject(neighbors, n => n.equals(v1) || n.equals(v2) || n.equals(v3));
          // Ear is delaunay if none of the other neighbors fall inside the circumcircle
          const delaunayValid = !_.some(otherNbrs, n => detH(v1, v2, v3, n) > 0);
          if (delaunayValid) ear = [v1, v2, v3];
        }
        i += 1;
      }
      assert(!_.isNull(ear), 'Could not find valid ear to remove');
      // Flip the diagonal to remove a neighbor of p
      this.removeTriangleByPoints(p, ear[0], ear[1]);
      this.removeTriangleByPoints(p, ear[1], ear[2]);
      this.addTriangle(new Triangle(ear[0], ear[1], ear[2]));
      this.addTriangle(new Triangle(ear[0], ear[2], p, false));
    }
    // Merge the remaining three triangles
    const neighbors = this.neighbors(p);
    assert(neighbors.length === 3);
    this.removeTriangleByPoints(p, neighbors[0], neighbors[1]);
    this.removeTriangleByPoints(p, neighbors[0], neighbors[2]);
    this.removeTriangleByPoints(p, neighbors[1], neighbors[2]);
    this.addTriangle(new Triangle(neighbors[0], neighbors[1], neighbors[2]));
    this.removeVertex(p);
  }


  unfixEdge(e) {
    assert(this.isConnected(e.p1, e.p2), `Edge ${JSON.stringify(e)} not in graph`);
    const { p1, p2 } = e;
    this.fixedAdj[p1] = _.reject(this.fixedAdj[p1], p => p.equals(p2));
    this.fixedAdj[p2] = _.reject(this.fixedAdj[p2], p => p.equals(p1));
  }

  /**
   * @param {Edge[]} constrainedEdgesToRemove - a list of edges to unmark as fixed
   *   in the DTGraph
   * @param {Edge[]} constrainedEdgesToAdd - a list of edges to mark as fixed in
   *   the DTGraph
   * @param {Point[]} verticesToRemove - a list of vertices to remove from the DTGraph (and
   *   retriangulate around them after each removal)
   * @param {Point[]} verticesToAdd - a list of vertices to add to the DTGraph (and
   *   retriangulate around them after each addition)
   */
  dynamicUpdate(constrainedEdgesToRemove, constrainedEdgesToAdd, verticesToRemove, verticesToAdd) {
    _.forEach(constrainedEdgesToRemove, e => this.unfixEdge(e));
    _.forEach(verticesToRemove, v => this.delaunayRemoveVertex(v, true));
    _.forEach(verticesToAdd, v => this.delaunayAddVertex(v, true));
    _.forEach(constrainedEdgesToAdd, e => this.delaunayAddConstraintEdge(e, true));
  }
}
