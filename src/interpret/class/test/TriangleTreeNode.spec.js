import test from 'tape';
import { TriangleTreeNode } from '../TriangleTreeNode';
import { Point } from '../Point';
import { Triangle } from '../Triangle';


test('TriangleTreeNode.addVertex()', tester => {
  tester.test('returns correct triangles when inserting into middle of triangle', t => {
    const node = new TriangleTreeNode(new Triangle(
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10),
    ));

    const { containingTriangles, newTriangles } = node.addVertex(new Point(5, 5));
    t.is(containingTriangles.length, 1);
    t.is(newTriangles.length, 3);
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
    let { containingTriangles, newTriangles } = node.addVertex(new Point(5, 5));
    t.is(containingTriangles.length, 1);
    t.is(newTriangles.length, 3);
    t.is(node.findAllNodes().length, 3);

    // Break left triangle into 3 triangles
    let res = node.addVertex(new Point(3, 5));
    containingTriangles = res.containingTriangles;
    newTriangles = res.newTriangles;
    t.is(containingTriangles.length, 1);
    t.is(newTriangles.length, 3);
    t.is(node.findAllNodes().length, 5); // we should have add 2 to the triangle count

    // Break right triangle into 3 triangles
    res = node.addVertex(new Point(7, 5));
    containingTriangles = res.containingTriangles;
    newTriangles = res.newTriangles;
    t.is(containingTriangles.length, 1);
    t.is(newTriangles.length, 3);
    t.is(node.findAllNodes().length, 7); // added 2 more to triangle count

    // Break bottom triangle into 3 triangles
    res = node.addVertex(new Point(5, 3));
    containingTriangles = res.containingTriangles;
    newTriangles = res.newTriangles;
    t.is(containingTriangles.length, 1);
    t.is(newTriangles.length, 3);
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
    let { containingTriangles, newTriangles } = node.addVertex(new Point(5, 5));
    t.is(containingTriangles.length, 1);
    t.is(newTriangles.length, 3);
    t.is(node.findAllNodes().length, 3);

    // Insert into border of left and right triangle
    const res = node.addVertex(new Point(5, 7));
    containingTriangles = res.containingTriangles;
    newTriangles = res.newTriangles;
    t.is(containingTriangles.length, 2);
    t.is(newTriangles.length, 4);
    t.is(node.findAllNodes().length, 5); // we should have add 2 to the triangle count

    t.end();
  });
});
