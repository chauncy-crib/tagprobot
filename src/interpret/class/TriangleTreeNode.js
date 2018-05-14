import _ from 'lodash';
import { assert } from '../../global/utils';
import { Triangle } from './Triangle';
import { Edge } from '../../global/class/Edge';
import { isLegal } from '../graphToTriangulation';
import { detD, detH, sortCounterClockwise } from '../utils';


let counter = 0;


export function getTriangles(nodes) {
  return _.map(nodes, n => n.triangle);
}


/**
 * @param {TriangleTreeNode[]} intersectingTriangles - array of nodes that intersect the edge
 * @param {Edge} e
 * @returns {{upperPoints: Point[], lowerPoints: Point[], orderedNodes: TriangleTreeNode[]}} the
 *   ordered points of the upper and lower regions that share the edge, and the nodes containing
 *   the points in order
 */
export function findUpperAndLowerPoints(intersectingNodes, e) {
  let nodes = intersectingNodes;
  // Keep track of the points in order in the regions above and below the edge
  const upperPoints = [e.p1];
  const lowerPoints = [e.p1];

  const orderedNodes = Array(nodes.length);
  let i = 0;

  while (!_.isEmpty(nodes)) {
    const lastUpperPoint = _.last(upperPoints);
    const lastLowerPoint = _.last(lowerPoints);

    // Find next triangle
    const nextN = _.find(nodes, n => (
      n.triangle.hasPoint(lastUpperPoint) && n.triangle.hasPoint(lastLowerPoint)
    ));

    assert(!_.isNil(nextN), 'Could not find node containing both last upper and last lower');

    orderedNodes[i] = nextN;

    // Add points to upperPoints and lowerPoints
    if (upperPoints.length === 1) {
      // This is the first triangle, add one point to upper polygon and the other to lower
      const newPoints = _.reject(nextN.triangle.getPoints(), p => p.equals(lastUpperPoint));
      upperPoints.push(newPoints[0]);
      lowerPoints.push(newPoints[1]);
    } else {
      // Get the third point that's not in either pseudo-polygon
      const newPoint = _.find(nextN.triangle.getPoints(), p => (
        !p.equals(lastUpperPoint) && !p.equals(lastLowerPoint)
      ));

      if (newPoint.equals(e.p2)) {
        // This is the last point, add it to both regions
        upperPoints.push(newPoint);
        lowerPoints.push(newPoint);
      } else {
        // Push point to either upper or lower region
        if (!e.isBetweenPoints(newPoint, lastUpperPoint, false)) upperPoints.push(newPoint);
        else lowerPoints.push(newPoint);
      }
    }

    // Remove triangle and edges from graph and from triangles
    nodes = _.reject(nodes, nextN);
    i += 1;
  }
  return { upperPoints, lowerPoints, orderedNodes };
}


export class TriangleTreeNode {
  /**
   * @param {Triangle} triangle
   */
  constructor(triangle) {
    this.triangle = triangle;
    this.children = [];
    this.mark = false; // keep track of which nodes have been visited in _findLeavesWithCondition()
    this.id = counter;
    counter += 1;
  }


  toString() {
    return `t: ${this.triangle}, c1: ${this.children[0]}, c2: ${this.children[1]}, ` +
      `c3: ${this.children[2]}`;
  }


  /**
   * @param {TriangleTreeNode} child
   */
  addChild(child) {
    this.children.push(child);
  }


  isLeaf() {
    return this.children.length === 0;
  }


  /**
   * Inserts a new point into the triangulation by splitting apart the triangle(s) that contained
   *   the point. If the point lays directly inside a triangle, three new triangles are created
   *   inside the containing triangle. If the point lays on an edge, then the edge is split in half,
   *   and both triangles which have that edge are split in half (creating four new triangles).
   * @param {Point} p
   * @returns {{containingTriangles: Triangle[], newNodes: TriangleTreeNode[]}} the triangle(s) that
   *   contained the point, and the new nodes containing triangles created by splitting apart the
   *   containing triangles.
   */
  addVertex(p) {
    const containingNodes = this.findContainingNodes(p);
    if (containingNodes.length === 1) {
      const containingTriangle = containingNodes[0].triangle;
      const { p1, p2, p3 } = containingTriangle;
      const newTriangles = [
        new Triangle(p1, p2, p),
        new Triangle(p1, p3, p),
        new Triangle(p2, p3, p),
      ];
      const newNodes = [];
      _.forEach(newTriangles, nt => {
        const newN = new TriangleTreeNode(nt);
        newNodes.push(newN);
        containingNodes[0].addChild(newN);
      });
      return { containingTriangles: [containingTriangle], newNodes };
    } else if (containingNodes.length === 2) {
      const ct1 = containingNodes[0].triangle;
      const ct2 = containingNodes[1].triangle;
      const cp = ct1.categorizePoints(ct2); // categorized points
      assert(cp.shared.length === 2, `cp.shared length was ${cp.shared.length}`);
      const newTriangles = [
        new Triangle(cp.shared[0], cp.myPoint, p),
        new Triangle(cp.shared[0], cp.otherPoint, p),
        new Triangle(cp.shared[1], cp.myPoint, p),
        new Triangle(cp.shared[1], cp.otherPoint, p),
      ];
      const newNodes = _.map(newTriangles, t => new TriangleTreeNode(t));
      containingNodes[0].addChild(newNodes[0]);
      containingNodes[0].addChild(newNodes[2]);
      containingNodes[1].addChild(newNodes[1]);
      containingNodes[1].addChild(newNodes[3]);
      return { containingTriangles: [ct1, ct2], newNodes };
    }
    assert(false, `Found ${containingNodes.length} containingNodes for ${p}`);
    return null;
  }


  /**
   * @param {Triangle} t
   * @param {Edge} edge
   * @returns {TriangleTreeNode} the node containing the triangle that shares the edge with t
   */
  findNodeAcross(t, edge) {
    const nodesWithEdge = this.findNodesWithEdge(edge);
    if (nodesWithEdge.length === 1) {
      assert(
        nodesWithEdge[0].triangle.equals(t),
        `Only triangle with edge ${edge} was ${nodesWithEdge[0].triangle}`,
      );
      return null;
    }
    assert(nodesWithEdge.length === 2, `Found ${nodesWithEdge.length} nodes with edge ${edge}`);
    if (nodesWithEdge[0].triangle.equals(t)) return nodesWithEdge[1];
    assert(
      nodesWithEdge[1].triangle.equals(t),
      `${t} was not in nodesWithEdge`,
    );
    return nodesWithEdge[0];
  }


  /**
   * @param {Triangle} t
   * @returns {TriangleTreeNode} the node containing the triangle, null if doesn't exist
   */
  findNodeWithTriangle(t) {
    const nodesWithCenter = this.findContainingNodes(t.getCenter());
    const N = _.filter(nodesWithCenter, n => n.triangle.equals(t));
    assert(N.length < 2, `found ${N.length} nodes with triangle ${t}`);
    return N.length === 0 ? null : N[0];
  }


  /**
   * Removes a vertex from the triangulation, and creates new delaunay-valid triangles its place
   * @param {Point} p
   * @param {Point[]} neighbors - the neighbors of p in the graph
   */
  removeVertex(p, neighbors) {
    const N = sortCounterClockwise(neighbors, p);
    // The indices of neighbors we have not detached from p
    const nIndices = _.range(N.length);
    // The triangles surrounding p
    const surroundingNodes = _.map(nIndices, nIdx => this.findNodeWithTriangle(new Triangle(
      p,
      N[nIdx],
      N[(nIdx + 1) % N.length],
    )));
    const oldTriangles = getTriangles(surroundingNodes);
    const newTriangles = [];
    while (nIndices.length > 3) {
      let ear = null;
      let i = -1;
      const L = nIndices.length;
      while (!ear && i < L - 1) {
        i += 1;
        // The three consecutive neighbors still attached to p
        const v1 = N[nIndices[i]];
        const v2 = N[nIndices[(i + 1) % L]];
        const v3 = N[nIndices[(i + 2) % L]];
        if (detD(v1, v2, v3) >= 0 && detD(v1, v3, p) >= 0) {
          // Neighbors not in this triple
          const otherNbrs = _.map(_.range(i + 3, i + L), j => N[nIndices[j % L]]);
          // Ear is delaunay-legal if none of the other neighbors fall inside the circumcircle
          const delaunayValid = !_.some(otherNbrs, n => detH(v1, v2, v3, n) > 0);
          if (delaunayValid) ear = [v1, v2, v3];
        }
      }
      assert(ear, 'Could not find valid ear to remove');
      const newNode = new TriangleTreeNode(new Triangle(ear[0], ear[1], ear[2]));
      newTriangles.push(newNode.triangle);
      let j = nIndices[i];
      // Add the newNode as a child of all old nodes which overlap with it
      while (j !== nIndices[(i + 2) % L]) {
        surroundingNodes[j].addChild(newNode);
        j = (j + 1) % N.length;
      }
      nIndices.splice((i + 1) % L, 1);
    }
    // The final triangle overlaps with every old triangle
    const finalNewNode = new TriangleTreeNode(new Triangle(
      N[nIndices[0]],
      N[nIndices[1]],
      N[nIndices[2]],
    ));
    newTriangles.push(finalNewNode.triangle);
    _.forEach(surroundingNodes, nt => nt.addChild(finalNewNode));
    return { oldTriangles, newTriangles };
  }


  /**
   * @param {Edge} e
   * @returns {TriangleTreeNode[]} all nodes with triangles which have one edge equal to e
   */
  findNodesWithEdge(e) {
    const n1 = this.findContainingNodes(e.p1);
    const n2 = this.findContainingNodes(e.p2);
    return _.uniq(_.filter(n1.concat(n2), n => n.triangle.hasEdge(e)));
  }


  /**
   * @param {Edge} e
   * @returns {Triangle[]}
   */
  findTrianglesWithEdge(e) {
    return getTriangles(this.findNodesWithEdge(e));
  }


  /**
   * @param {Edge} e
   * @returns {TriangleTreeNode[]} all nodes with triangles where t.intersectsEdge(e) returns true
   */
  findNodesIntersectingEdge(e) {
    return this.findLeavesWithCondition(
      // Parent condition: either the edge intersects the triangle, or one of the triangle's edges
      //   overlaps the input edge
      n => n.triangle.intersectsEdge(e) ||
        _.some(n.triangle.getEdges(), et => et.overlapsEdge(e)),
      // Leaf condition: the triangle intersects the edge
      n => n.triangle.intersectsEdge(e),
    );
  }


  /**
   * Given two functions, both of which take in a node and return a boolean, finds all leaf nodes
   *   where leafCondition(leaf) returns true, and parentCondition(parent) returns true for all
   *   parents, grandparents, etc. of the leaf node.
   */
  findLeavesWithCondition(parentCondition, leafCondition) {
    const leafCond = leafCondition || parentCondition;
    const nodes = [];
    const visited = [];
    this._findLeavesWithCondition(parentCondition, leafCond, nodes, visited);
    // Undo the markings
    _.forEach(visited, n => {
      n.mark = false;
    });
    return nodes;
  }


  /**
   * The private recursive function for findLeavesWithCondition. Not meant for outside use, as it
   *   leaves marking on nodes, and the user is responsible for clearing markings from all nodes in
   *   visited. If markings are not cleared, future function calls will have unexpected behavior.
   */
  _findLeavesWithCondition(parentCondition, leafCondition, nodes, visited) {
    if (this.mark) return;
    this.mark = true; // mark the node so we don't visit it again
    visited.push(this);
    if (!parentCondition(this)) return;
    if (this.isLeaf() && leafCondition(this)) nodes.push(this);
    _.forEach(
      this.children,
      c => c._findLeavesWithCondition(parentCondition, leafCondition, nodes, visited),
    );
  }


  /**
   * @param {Point} p
   * @returns {TriangleTreeNode[]} all nodes with triangles which have one point equal to p
   */
  findNodesWithPoint(p) {
    return _.filter(this.findContainingNodes(p), n => n.triangle.hasPoint(p));
  }


  /**
   * @param {Point} p
   * @returns {TriangleTreeNode[]}
   */
  findContainingNodes(p) {
    return this.findLeavesWithCondition(n => n.triangle.containsPoint(p));
  }


  /**
   * @param {Point} p
   * @returns {Triangle[]}
   */
  findContainingTriangles(p) {
    return getTriangles(this.findContainingNodes(p));
  }


  /**
   * @returns {Triangle[]} all triangles in leaf-nodes that are descendents of this node
   */
  findAllTriangles() {
    return getTriangles(this.findAllNodes());
  }


  /**
   * @returns {TriangleTreeNode[]} all leaf-nodes that are descendents of this node
   */
  findAllNodes() {
    return this.findLeavesWithCondition(() => true);
  }
}


/**
 * Recursively triangulates an un-triangulated region of points. Adds all new triangles as
 *   children to every node in regNodes, and appends them to the newTriangles array.
 * @param {Point[]} reg - the region defined by an array of points connected in a cycle
 * @param {TriangleTreeNode[]} regNodes - an array of nodes containing triangles that span across
 *   the region
 * @param {Triangle[]} newTriangles - an array to store every new triangle the function creates in
 */
export function triangulateRegion(reg, regNodes, newTriangles) {
  if (reg.length === 3) {
    const newTriangle = new Triangle(reg[0], reg[1], reg[2]);
    newTriangles.push(newTriangle);
    const newNode = new TriangleTreeNode(newTriangle);
    _.forEach(regNodes, n => n.addChild(newNode));
  }
  if (reg.length <= 3) return;
  // Extract out the points on the edge
  const e = new Edge(reg[0], _.last(reg));
  // Slice off the first and last element to get the inner region
  const innerReg = _.slice(reg, 1, -1);

  // Find vertex c on the region that triangle [e1, e2, c] is delaunay-legal with all other
  //   points in the region
  const cIndex = _.findIndex(innerReg, p =>
    // Must be delaunay-legal with respect to every other point
    _.every(innerReg, other => isLegal(p, e, other) || p === other));

  const newTriangle = new Triangle(e.p1, innerReg[cIndex], e.p2);
  newTriangles.push(newTriangle);
  const newNode = new TriangleTreeNode(newTriangle);
  _.forEach(regNodes, n => n.addChild(newNode));

  // Call this recursively on the two sub-regions split by this triangle
  triangulateRegion(
    _.concat(e.p1, _.slice(innerReg, 0, cIndex + 1)),
    regNodes,
    newTriangles,
  );
  triangulateRegion(
    _.concat(_.slice(innerReg, cIndex, innerReg.length), e.p2),
    regNodes,
    newTriangles,
  );
}
