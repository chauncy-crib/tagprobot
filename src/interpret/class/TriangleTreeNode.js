import _ from 'lodash';
import { assert } from '../../global/utils';
import { Triangle } from './Triangle';

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
   * @param {Edge} e
   * @returns {TriangleTreeNode[]} all nodes with triangles which have one edge equal to e
   */
  findNodesWithEdge(e) {
    const n1 = this.findContainingNodes(e.p1);
    const n2 = this.findContainingNodes(e.p2);
    return _.uniq(_.filter(n1.concat(n2), n => n.triangle.hasEdge(e)));
  }


  /**
   * @param {Point} p
   * @returns {TriangleTreeNode[]}
   */
  findContainingNodes(p) {
    const nodes = [];
    this.privateFindContainingNodes(p, nodes);
    // Undo the markings
    _.forEach(nodes, n => {
      delete n.mark;
    });
    return nodes;
  }

  privateFindContainingNodes(p, nodes) {
    // TODO: should this be shares area with?
    if (!this.triangle.containsPoint(p)) return;
    if (this.isLeaf()) {
      if (!this.mark && this.triangle.containsPoint(p)) {
        nodes.push(this);
        this.mark = true;
      }
    } else {
      _.forEach(this.children, c => c.privateFindContainingNodes(p, nodes));
    }
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
    const nodes = [];
    this.privateFindAllNodes(nodes);
    // Undo the markings
    _.forEach(nodes, n => {
      delete n.mark; // TODO, are these deletes efficient?
    });
    return nodes;
  }

  // For class-internal use only
  // TODO; use underscores
  privateFindAllNodes(nodes) {
    // TODO: does recursion in JS suck dicks?
    if (this.isLeaf() && !this.mark) {
      // Mark nodes we add so we know not to add them to the list again. This is because there are
      //   multiple valid paths from the root to each leaf.
      nodes.push(this);
      this.mark = true;
    }
    _.forEach(this.children, c => c.privateFindAllNodes(nodes));
  }
}
