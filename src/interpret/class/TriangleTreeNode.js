import _ from 'lodash';
import { assert } from '../../global/utils';
import { Triangle } from './Triangle';
import { detD, detH, sortCounterClockwise } from '../utils';

export class TriangleTreeNode {
  /**
   * @param {Triangle} triangle
   */
  constructor(triangle) {
    this.triangle = triangle;
    this.children = [];
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
      assert(nodesWithEdge[0].triangle.equals(t));
      return null;
    }
    assert(nodesWithEdge.length === 2, `Found ${nodesWithEdge.length} nodes with edge ${edge}`);
    if (nodesWithEdge[0].triangle.equals(t)) return nodesWithEdge[1];
    assert(nodesWithEdge[1].triangle.equals(t));
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
   * @param {Point} p
   * @param {Point[]} neighbors - the neighbors of p in the graph
   */
  removeVertex(p, neighbors) {
    const N = sortCounterClockwise(neighbors, p);
    // The indices of neighbors we have not detached from p
    const nIndices = _.range(N.length);
    // The triangles surrounding p
    const nTriangles = _.map(nIndices, nIdx => this.findNodeWithTriangle(new Triangle(
      p,
      N[nIdx],
      N[(nIdx + 1) % N.length],
    )));
    _.forEach(nTriangles, nt => assert(nt, 'nt was null'));
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
      let j = nIndices[i];
      // Add the newNode as a child of all old nodes which overlap with it
      while (j !== nIndices[(i + 2) % L]) {
        nTriangles[j].addChild(newNode);
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
    _.forEach(nTriangles, nt => nt.addChild(finalNewNode));
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
   * @returns {TriangleTreeNode[]} all nodes with triangles where t.intersectsEdge(e) returns true
   */
  findNodesIntersectingEdge(e) {
    return this.findNodesWithCondition(
      // Parent condition: either the edge intersects the triangle, or one of the triangle's edges
      //   overlaps the input edge
      n => n.triangle.intersectsEdge(e) ||
        _.some(n.triangle.getEdges(), et => et.overlapsEdge(e)),
      // Leaf condition: the triangle intersects the edge
      n => n.triangle.intersectsEdge(e),
    );
  }

  findNodesWithCondition(parentCondition, leafCondition) {
    const leafCond = leafCondition || parentCondition;
    const nodes = [];
    this.privateFindNodesWithCondition(parentCondition, leafCond, nodes);
    // Undo the markings
    _.forEach(nodes, n => {
      delete n.mark;
    });
    return nodes;
  }

  privateFindNodesWithCondition(parentCondition, leafCondition, nodes) {
    // TODO: should this be shares area with?
    if (!parentCondition(this)) return;
    if (this.isLeaf()) {
      if (!this.mark && leafCondition(this)) {
        nodes.push(this);
        this.mark = true;
      }
    } else {
      _.forEach(
        this.children,
        c => c.privateFindNodesWithCondition(parentCondition, leafCondition, nodes),
      );
    }
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
    return this.findNodesWithCondition(n => n.triangle.containsPoint(p));
  }


  /**
   * @returns {Triangle[]} all triangles in leaf-nodes that are descendents of this node
   */
  findAllTriangles() {
    return _.map(this.findAllNodes(), n => n.triangle);
  }

  /**
   * @returns {TriangleTreeNode[]} all leaf-nodes that are descendents of this node
   */
  findAllNodes() {
    return this.findNodesWithCondition(() => true);
  }
}
