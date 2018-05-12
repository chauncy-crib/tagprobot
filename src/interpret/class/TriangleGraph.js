import _ from 'lodash';
import fp from 'lodash/fp';
import { assert } from '../../global/utils';
import {
  TriangleTreeNode,
  getTriangles,
  findUpperAndLowerPoints,
  triangulateRegion,
} from './TriangleTreeNode';
import { Point } from '../../global/class/Point';
import { Edge } from '../../global/class/Edge';
import { Triangle } from './Triangle';
import { DrawableGraph } from '../../draw/class/DrawableGraph';
import { isLegal } from '../graphToTriangulation';
import { COLORS, ALPHAS, THICKNESSES } from '../../draw/constants';

const CLEARANCE = 27; // sqrt(BRP^2 + BRP^2) to have full clearance around a right-angle corner


/**
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


  fromObject(o) {
    super.fromObject(o);
    this.polypoints = (new DrawableGraph(
      THICKNESSES.triangulation,
      ALPHAS.polypoints.vertex,
      COLORS.polypoints.edge,
      () => ({
        color: COLORS.polypoints.edge,
        alpha: ALPHAS.polypoints.edge,
        thickness: THICKNESSES.triangulation,
      }),
    )).fromObject(o.polypoints);
    this.rootNode = (new TriangleTreeNode()).fromObject(o.rootNode);
    _.forOwn(o.fixedAdj, (adjList, pointStr) => {
      this.fixedAdj[pointStr] = _.map(adjList, p => (new Point()).fromObject(p));
    });
    return this;
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
    this.addTriangle(t);
  }


  findContainingTriangles(p) {
    return this.rootNode.findContainingTriangles(p);
  }


  findTriangleByPoints(p1, p2, p3) {
    const n = this.rootNode.findNodeWithTriangle(new Triangle(p1, p2, p3));
    return n ? n.triangle : null;
  }


  clear() {
    super.clear();
    this.initDataStructures();
  }


  numTriangles() {
    return this.rootNode.findAllTriangles().length;
  }


  /**
   * Given a triangle, adds polypoints between it and all other triangles which share a non-fixed
   *   edge
   */
  connectPolypoint(t) {
    _.flow(
      fp.reject(e => this.isEdgeFixed(e)), // ignore fixed edges
      fp.map(e => this.rootNode.findNodeAcross(t, e)), // find nodes which share an edge with t
      fp.reject(_.isNil),
      fp.map(n => n.triangle.getCenter()),
      // Add edge between center of neighbor nodes and this one
      fp.forEach(adjCenter => { this.polypoints.addEdge(new Edge(t.getCenter(), adjCenter)); }),
    )(t.getEdges());
  }


  /**
   * Adds the edges and vertices from a triangle to the graph, if they do not exist. Adds the center
   *   of the triangle to the polypoint-graph
   */
  addTriangle(t) {
    this.addEdgeAndVertices(new Edge(t.p1, t.p2));
    this.addEdgeAndVertices(new Edge(t.p1, t.p3));
    this.addEdgeAndVertices(new Edge(t.p2, t.p3));
    this.polypoints.addVertex(t.getCenter());
  }


  /**
   * Removes the edges of the triangle from the graph. Removes the polypoint from the polypoint
   * graph (and clears all edges going to it)
   */
  removeTriangle(t) {
    const tCenter = t.getCenter();
    if (this.polypoints.hasVertex(tCenter)) {
      this.polypoints.removeVertex(tCenter);
    }
    _.forEach(t.getEdges(), e => this.removeEdge(e));
  }


  /**
   * Removes the edges and polypoint for each triangle in trianglesToRemove, and adds edges,
   *   vertices, and polypoints for each triangle in trianglesToAdd.
   */
  updateGraph(trianglesToRemove, trianglesToAdd) {
    _.forEach(trianglesToRemove, t => this.removeTriangle(t));
    _.forEach(trianglesToAdd, t => this.addTriangle(t));
    _.forEach(trianglesToAdd, t => this.connectPolypoint(t));
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
  delaunayAddVertex(p) {
    assert(!this.hasVertex(p));
    const { containingTriangles, newNodes } = this.rootNode.addVertex(p);
    assert(
      containingTriangles.length > 0 && containingTriangles.length <= 2,
      `Found ${containingTriangles.length} containing triangles`,
    );
    this.updateGraph(containingTriangles, getTriangles(newNodes));
    _.forEach(newNodes, n => this.legalizeEdgeNode(n, p));
  }

  /**
   * If the edge is not delaunay-legal, flip it, and recursively legalize the resulting triangles.
   * @param {TriangleTreeNode} node
   * @param {Point} newPoint
   */
  legalizeEdgeNode(node, newPoint) {
    // Find the edge that will be between newPoint and oppositePoint
    const edgeBetween = node.triangle.getEdgeWithoutPoint(newPoint);
    // If the edge is fixed, we cannot flip it
    if (this.isEdgeFixed(edgeBetween)) return;
    // Find the node containing the triangle sharing an edge with node.triangle, but without point
    //   newPoint
    const otherNode = this.rootNode.findNodeAcross(node.triangle, edgeBetween);
    if (otherNode) {
      const oppositePoint = otherNode.triangle.getPointNotOnEdge(edgeBetween);
      if (!isLegal(newPoint, edgeBetween, oppositePoint)) {
        // If the edge is illegal, flip it by creating the two new triangles, and adding them as
        //   children to the two old triangles
        const t1 = new Triangle(newPoint, oppositePoint, edgeBetween.p1);
        const t2 = new Triangle(newPoint, oppositePoint, edgeBetween.p2);
        const n1 = new TriangleTreeNode(t1);
        const n2 = new TriangleTreeNode(t2);
        node.addChild(n1);
        node.addChild(n2);
        otherNode.addChild(n1);
        otherNode.addChild(n2);
        // Remove the old triangles, add the new ones from the graph
        this.updateGraph([node.triangle, otherNode.triangle], [t1, t2]);
        // Recursively legalize resulting triangles
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
  delaunayAddConstraintEdge(e) {
    const trianglesAcross = this.rootNode.findTrianglesWithEdge(e);
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

    const intersectingNodes = this.rootNode.findNodesIntersectingEdge(e);
    const newTriangles = [];
    const { upperPoints, lowerPoints, orderedNodes } = findUpperAndLowerPoints(
      intersectingNodes,
      e,
    );
    triangulateRegion(upperPoints, orderedNodes, newTriangles);
    triangulateRegion(lowerPoints, orderedNodes, newTriangles);
    this.addFixedEdge(e);
    this.updateGraph(getTriangles(intersectingNodes), newTriangles);
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
  delaunayRemoveVertex(p) {
    const { oldTriangles, newTriangles } = this.rootNode.removeVertex(p, this.neighbors(p));
    this.updateGraph(oldTriangles, newTriangles);
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
    _.forEach(verticesToRemove, v => this.delaunayRemoveVertex(v));
    _.forEach(verticesToAdd, v => this.delaunayAddVertex(v));
    _.forEach(constrainedEdgesToAdd, e => this.delaunayAddConstraintEdge(e));
  }
}
