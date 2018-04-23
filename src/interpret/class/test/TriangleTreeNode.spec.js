import test from 'tape';
import { TriangleTreeNode } from '../TriangleTreeNode';
import { Edge } from '../Edge';
import { Point } from '../Point';
import { Triangle } from '../Triangle';


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
