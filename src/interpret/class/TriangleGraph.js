import _ from 'lodash';

import { assert } from '../../global/utils';
import { TriangleTreeNode } from './TriangleTreeNode';
import { Point } from './Point';
import { Edge } from './Edge';
import { Triangle } from './Triangle';
import { DrawableGraph } from '../../draw/class/DrawableGraph';
import { isLegal } from '../graphToTriangulation';
import { COLORS, ALPHAS, THICKNESSES } from '../../draw/constants';

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


  addFirstTriangle(t) {
    assert(this.numVertices() === 0, `addFirstTriangle called with ${this.numVertices()} vertices`);
    this.rootNode = new TriangleTreeNode(t);
  }

  findContainingTriangles(p) {
    return _.map(this.rootNode.findContainingNodes(p), n => n.triangle);
  }


  clear() {
    super.clear();
    this.initDataStructures();
  }

  numTriangles() {
    return this.rootNode.findAllTriangles().length;
  }

  updatePolypoints(t) {
    const unfixedEdges = _.reject(t.getEdges(), e => this.isEdgeFixed(e));
    const nodesAcross = _.map(unfixedEdges, e => this.rootNode.findNodeAcross(t, e));
    const nullFiltered = _.reject(nodesAcross, _.isNil);
    const tAcross = _.map(nullFiltered, n => n.triangle);
    _.forEach(tAcross, adjT => {
      const adjCenter = adjT.getCenter();
      this.polypoints.addEdge(new Edge(t.getCenter(), adjCenter));
    });
  }


  addTriangleEdgesAndVertices(t) {
    this.addEdgeAndVertices(new Edge(t.p1, t.p2));
    this.addEdgeAndVertices(new Edge(t.p1, t.p3));
    this.addEdgeAndVertices(new Edge(t.p2, t.p3));
    this.polypoints.addVertex(t.getCenter());
  }


  removeTrianglePointsEdgesPolypoints(t) {
    if (this.polypoints.hasVertex(t.getCenter())) {
      this.polypoints.removeVertex(t.getCenter());
    }
    _.forEach(t.getEdges(), e => this.removeEdge(e));
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
   * Adds the point to the triangulation. Ensures the triangulation is delaunay-legal after
   *   insertion
   */
  delaunayAddVertex(p, updateNode = false) {
    assert(!this.hasVertex(p));
    if (updateNode) {
      const { containingTriangles, newNodes } = this.rootNode.addVertex(p);
      assert(
        containingTriangles.length > 0 && containingTriangles.length <= 2,
        `Found ${containingTriangles.length} containing triangles`,
      );
      _.forEach(containingTriangles, t => this.removeTrianglePointsEdgesPolypoints(t));
      _.forEach(newNodes, n => this.addTriangleEdgesAndVertices(n.triangle));
      _.forEach(newNodes, n => this.updatePolypoints(n.triangle));
      _.forEach(newNodes, n => this.legalizeEdgeNode(n, p));
    }
  }

  /**
   * @param {TriangleTreeNode} node
   * @param {Point} newPoint
   */
  legalizeEdgeNode(node, newPoint) {
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
        this.removeTrianglePointsEdgesPolypoints(node.triangle);
        this.removeTrianglePointsEdgesPolypoints(otherNode.triangle);
        this.addTriangleEdgesAndVertices(t1);
        this.addTriangleEdgesAndVertices(t2);
        this.updatePolypoints(t1);
        this.updatePolypoints(t2);
        this.legalizeEdgeNode(n1, newPoint);
        this.legalizeEdgeNode(n2, newPoint);
      }
    }
  }


  /**
   * Adds an edge to the graph as a constrained edge and re-triangulates the affected surrounding
   *   region
   * @param {Edge} e - the edge to add
   */
  delaunayAddConstraintEdge(e, updateNode = false) {
    const trianglesAcross = _.map(this.rootNode.findNodesWithEdge(e), n => n.triangle);
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

    if (updateNode) {
      const intersectingNodes = this.rootNode.findNodesIntersectingEdge(e);
      const newTriangles = [];
      _.forEach(intersectingNodes, n => this.removeTrianglePointsEdgesPolypoints(n.triangle));
      const { upperPoints, lowerPoints, orderedNodes } = TriangleTreeNode.findUpperAndLowerPoints(
        intersectingNodes,
        e,
      );
      TriangleTreeNode.triangulateRegion(upperPoints, orderedNodes, newTriangles);
      TriangleTreeNode.triangulateRegion(lowerPoints, orderedNodes, newTriangles);
      this.addFixedEdge(e);
      _.forEach(newTriangles, t => this.addTriangleEdgesAndVertices(t));
      _.forEach(newTriangles, t => this.updatePolypoints(t));
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
      const { oldTriangles, newTriangles } = this.rootNode.removeVertex(p, this.neighbors(p));
      _.forEach(oldTriangles, t => this.removeTrianglePointsEdgesPolypoints(t));
      _.forEach(newTriangles, t => this.addTriangleEdgesAndVertices(t));
      _.forEach(newTriangles, t => this.updatePolypoints(t));
      this.removeVertex(p);
    }
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
