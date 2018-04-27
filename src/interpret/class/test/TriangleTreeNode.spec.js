import test from 'tape';
import _ from 'lodash';
import { TriangleTreeNode } from '../TriangleTreeNode';
import { Edge } from '../Edge';
import { Point } from '../Point';
import { Triangle } from '../Triangle';


test('TriangleTreeNode.findContainingNodes()', tester => {
  tester.test('returns correct number of nodes', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));

    node.addVertex(new Point(5, 5));
    t.is(node.findContainingNodes(new Point(5, 5)).length, 3);
    t.is(node.findContainingNodes(new Point(6, 5)).length, 1);
    t.is(node.findContainingNodes(new Point(0, -1)).length, 0);

    t.end();
  });
});


test('TriangleTreeNode.addVertex()', tester => {
  tester.test('returns correct triangles when inserting into middle of triangle', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));

    const { containingTriangles, newNodes } = node.addVertex(new Point(5, 5));
    t.is(containingTriangles.length, 1);
    t.is(newNodes.length, 3);
    t.is(node.findAllNodes().length, 3);

    t.end();
  });

  tester.test('returns correct triangles when inserting into middle of triangles repeatedly', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));
    // Break original triangle into 3 triangles
    let { containingTriangles, newNodes } = node.addVertex(new Point(5, 5));
    t.is(containingTriangles.length, 1);
    t.is(newNodes.length, 3);
    t.is(node.findAllNodes().length, 3);

    // Break left triangle into 3 triangles
    let res = node.addVertex(new Point(3, 5));
    containingTriangles = res.containingTriangles;
    newNodes = res.newNodes;
    t.is(containingTriangles.length, 1);
    t.is(newNodes.length, 3);
    t.is(node.findAllNodes().length, 5); // we should have add 2 to the triangle count

    // Break right triangle into 3 triangles
    res = node.addVertex(new Point(7, 5));
    containingTriangles = res.containingTriangles;
    newNodes = res.newNodes;
    t.is(containingTriangles.length, 1);
    t.is(newNodes.length, 3);
    t.is(node.findAllNodes().length, 7); // added 2 more to triangle count

    // Break bottom triangle into 3 triangles
    res = node.addVertex(new Point(5, 3));
    containingTriangles = res.containingTriangles;
    newNodes = res.newNodes;
    t.is(containingTriangles.length, 1);
    t.is(newNodes.length, 3);
    t.is(node.findAllNodes().length, 9); // added 2 more to triangle count

    t.end();
  });

  tester.test('returns correct triangles when inserting onto triangle border', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));
    // Break original triangle into 3 triangles
    let { containingTriangles, newNodes } = node.addVertex(new Point(5, 5));
    t.is(containingTriangles.length, 1);
    t.is(newNodes.length, 3);
    t.is(node.findAllNodes().length, 3);

    // Insert into border of left and right triangle
    const res = node.addVertex(new Point(5, 7));
    containingTriangles = res.containingTriangles;
    newNodes = res.newNodes;
    t.is(containingTriangles.length, 2);
    t.is(newNodes.length, 4);
    t.is(node.findAllNodes().length, 5); // we should have add 2 to the triangle count

    t.end();
  });
});


test('TriangleTreeNode.findNodesWithEdge()', tester => {
  tester.test('returns correct nodes with edge', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));

    node.addVertex(new Point(5, 5));

    let nWithEdge = node.findNodesWithEdge(new Edge(new Point(5, 5), new Point(5, 10)));

    t.is(nWithEdge.length, 2);
    t.notEqual(nWithEdge[0], nWithEdge[1]);

    nWithEdge = node.findNodesWithEdge(new Edge(new Point(0, 0), new Point(10, 0)));
    t.is(nWithEdge.length, 1);

    nWithEdge = node.findNodesWithEdge(new Edge(new Point(5, 10), new Point(10, 0)));
    t.is(nWithEdge.length, 1);

    nWithEdge = node.findNodesWithEdge(new Edge(new Point(5, 5), new Point(10, 0)));
    t.is(nWithEdge.length, 2);

    t.end();
  });
});


test('TriangleTreeNode.findNodesWithPoint()', tester => {
  tester.test('returns correct triangles with point', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));

    node.addVertex(new Point(5, 5));
    node.addVertex(new Point(3, 5));

    let nodesWithPoint = node.findNodesWithPoint(new Point(3, 5));
    t.is(nodesWithPoint.length, 3);

    nodesWithPoint = node.findNodesWithPoint(new Point(5, 5));
    t.is(nodesWithPoint.length, 4);

    nodesWithPoint = node.findNodesWithPoint(new Point(4, 5));
    t.is(nodesWithPoint.length, 0);

    t.end();
  });
});

test('TriangleTreeNode.findNodeWithTriangle()', tester => {
  tester.test('returns node with input triangle', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));

    node.addVertex(new Point(5, 5));

    let tr = new Triangle(
      new Point(0, 0),
      new Point(5, 10),
      new Point(5, 5),
    );
    // Find the left triangle
    let n = node.findNodeWithTriangle(tr);
    t.true(n.triangle.equals(tr));

    node.addVertex(new Point(3, 5));

    // This triangle was broken apart, so we shouldn't find it anymore
    n = node.findNodeWithTriangle(tr);
    t.is(n, null);

    // One of the new smaller triangles
    tr = new Triangle(
      new Point(0, 0),
      new Point(5, 10),
      new Point(3, 5),
    );
    n = node.findNodeWithTriangle(tr);
    t.true(n.triangle.equals(tr));

    t.end();
  });
});


test('TriangleTreeNode.findNodeAcross()', tester => {
  tester.test('returns node across from triangle', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));

    node.addVertex(new Point(5, 5));

    const nodeAcross = node.findNodeAcross(new Triangle(
      new Point(0, 0),
      new Point(5, 10),
      new Point(5, 5),
    ), new Edge(new Point(5, 10), new Point(5, 5)));

    t.true(nodeAcross.triangle.equals(new Triangle(
      new Point(10, 0),
      new Point(5, 10),
      new Point(5, 5),
    )));

    t.end();
  });
});


test('TriangleTreeNode.removeVertex()', tester => {
  tester.test('removes vertex with 5 neighbors, and retriangulates region', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));
    node.addVertex(new Point(5, 3));
    node.addVertex(new Point(5, 7));
    node.addVertex(new Point(6, 7));
    const neighbors = [
      new Point(0, 0),
      new Point(5, 3),
      new Point(10, 0),
      new Point(5, 10),
      new Point(6, 7),
    ];

    t.is(node.findNodesWithPoint(new Point(5, 7)).length, 5);
    t.is(node.findAllNodes().length, 7);
    node.removeVertex(new Point(5, 7), neighbors);
    // After removal, there should be 2 less triangles
    t.is(node.findAllNodes().length, 5);
    // No triangles should have a vertex equal to the removed point
    t.is(node.findNodesWithPoint(new Point(5, 7)).length, 0);
    // But it should still be contained in the triangulation
    t.is(node.findContainingNodes(new Point(5, 7)).length, 1);

    t.end();
  });
});


test('TriangleTreeNode.findNodesIntersectingEdge()', tester => {
  tester.test('returns all nodes where n.triangle.intersectsEdge() is true', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));
    node.addVertex(new Point(5, 3));
    node.addVertex(new Point(5, 7));
    node.addVertex(new Point(6, 7));

    const edgesToTest = [
      new Edge(new Point(5, 7), new Point(6, 7)),
      new Edge(new Point(5, 7), new Point(5, 10)),
      new Edge(new Point(5, 8), new Point(5, 9)),
      new Edge(new Point(4, 7), new Point(6, 7)),
      new Edge(new Point(4, 6), new Point(6, 7)),
      new Edge(new Point(0, 0), new Point(10, 0)),
      new Edge(new Point(0, 0), new Point(6, 6)),
      new Edge(new Point(5, 7), new Point(5, 2)),
      new Edge(new Point(5, 10), new Point(5, 3)),
      new Edge(new Point(5, 10), new Point(4, 2)),
    ];


    // Check all the above edges to make sure the function returns the correct thing
    const runTest = () => {
      const allNodes = node.findAllNodes();
      _.forEach(edgesToTest, e => {
        const intersectingNodes1 = node.findNodesIntersectingEdge(e);
        const intersectingNodes2 = _.filter(allNodes, n => n.triangle.intersectsEdge(e));
        t.is(intersectingNodes1.length, intersectingNodes2.length);
      });
    };
    runTest();

    // Remove a vertex and run the test
    const neighbors = [
      new Point(0, 0),
      new Point(5, 3),
      new Point(10, 0),
      new Point(5, 10),
      new Point(6, 7),
    ];
    node.removeVertex(new Point(5, 7), neighbors);
    runTest();

    // Add it back and run the test
    node.addVertex(new Point(5, 7));
    runTest();

    node.addVertex(new Point(3, 4));
    runTest();

    t.end();
  });
});


test('TriangleTreeNode.findUpperAndLowerPoints()', tester => {
  tester.test('returns upper and lower points, and orderedNodes', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));
    node.addVertex(new Point(5, 3));
    node.addVertex(new Point(5, 7));
    node.addVertex(new Point(6, 7));
    const e = new Edge(new Point(0, 0), new Point(6, 7));
    const intersectingNodes = node.findNodesIntersectingEdge(e);

    const { upperPoints, lowerPoints, orderedNodes } = TriangleTreeNode.findUpperAndLowerPoints(
      intersectingNodes,
      e,
    );

    t.is(intersectingNodes.length, 3);
    // One of the lists should be length 3, the other should be length 4
    if (upperPoints.length === 4) {
      t.is(lowerPoints.length, 3);
    } else {
      t.is(upperPoints.length, 3);
      t.is(lowerPoints.length, 4);
    }
    t.is(orderedNodes.length, 3);

    t.end();
  });
});

