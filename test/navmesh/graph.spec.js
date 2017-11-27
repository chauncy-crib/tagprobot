import test from 'tape';
import {
  determinant,
  isLegal,
  sortCounterClockwise,
  Point,
  Triangle,
  TGraph,
} from '../../src/navmesh/graph';


test('determinant returns correct value for a 3x3', t => {
  t.is(determinant([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]), 0);
  t.is(determinant([
    [1, 3, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]), 6);
  t.is(determinant([
    [1, 3, 3],
    [4, 5, 6],
    [7, 4, 9],
  ]), -18);

  t.end();
});


test('determinant returns correct value for a 4x4', t => {
  t.is(determinant([
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
  ]), 0);
  t.is(determinant([
    [1, -2, 3, 4],
    [1, 5, 3, 7],
    [1, 2, 3, 4],
    [0, 2, 8, 4],
  ]), 96);
  t.is(determinant([
    [1, -2, 5, 4],
    [1, 5, 9, 7],
    [1, 2, 3, 4],
    [-1, 2, 8, 4],
  ]), -84);

  t.end();
});


test('isLegal', tester => {
  tester.test('returns true when oppositePoint outside circle', t => {
    let edge = { p1: new Point(0, 1), p2: new Point(2, 1) };
    let insertedPoint = new Point(1, 0);
    t.true(isLegal(insertedPoint, edge, new Point(1, -1)));
    t.true(isLegal(insertedPoint, edge, new Point(1, 2.1)));

    insertedPoint = new Point(1320, 1160);
    edge = { p1: new Point(1000, 1160), p2: new Point(14000000, 10000000) };
    t.true(isLegal(insertedPoint, edge, new Point(-3000000, -100)));

    insertedPoint = new Point(1160, 520);
    edge = { p1: new Point(80, 1560), p2: new Point(14000000, 10000000) };
    t.true(isLegal(insertedPoint, edge, new Point(-3000000, -100)));

    t.end();
  });

  tester.test('returns false when oppositePoint inside circle', t => {
    const edge = { p1: new Point(1, 0), p2: new Point(2, 1) };
    const insertedPoint = new Point(0, 1);

    t.false(isLegal(insertedPoint, edge, new Point(1, 1)));
    t.false(isLegal(insertedPoint, edge, new Point(0.1, 1)));

    t.end();
  });

  tester.test('returns true when oppositePoint on circle', t => {
    let edge = { p1: new Point(1, 0), p2: new Point(2, 1) };
    let insertedPoint = new Point(0, 1);
    t.true(isLegal(insertedPoint, edge, new Point(1, 2)));

    insertedPoint = new Point(840, 1480);
    edge = { p1: new Point(1000, 1360), p2: new Point(680, 1320) };
    t.true(isLegal(insertedPoint, edge, new Point(800, 1160)));

    t.end();
  });

  tester.end();
});


test('sortCounterClockwise sorts points in counter-clockwise order', t => {
  let points = [
    new Point(-1, 1),
    new Point(1, 1),
    new Point(1, -1),
    new Point(-1, -1),
  ];
  t.same(sortCounterClockwise(points), [
    new Point(-1, 1),
    new Point(-1, -1),
    new Point(1, -1),
    new Point(1, 1),
  ]);

  points = [
    new Point(0, 1),
    new Point(1, -1),
    new Point(-1, -1),
  ];
  t.same(sortCounterClockwise(points), [
    new Point(-1, -1),
    new Point(1, -1),
    new Point(0, 1),
  ]);

  points = [
    new Point(0, 1),
    new Point(2, 1),
    new Point(1, 0),
  ];
  t.same(sortCounterClockwise(points), [
    new Point(0, 1),
    new Point(1, 0),
    new Point(2, 1),
  ]);

  t.end();
});

test('findContainingTriangles finds containing triangles', t => {
  const tGraph = new TGraph();
  const p1 = new Point(0, 0);
  const p2 = new Point(-3, 8);
  const p3 = new Point(0, 10);
  const p4 = new Point(40, 40);
  const p5 = new Point(-40, 40);
  const t1 = new Triangle(p1, p2, p3);
  const t2 = new Triangle(p2, p3, p5);
  const t3 = new Triangle(p1, p3, p4);
  tGraph.addTriangle(t1);
  tGraph.addTriangle(t2);
  tGraph.addTriangle(t3);
  const c1 = tGraph.findContainingTriangles(new Point(1, 5));
  const c2 = tGraph.findContainingTriangles(new Point(0, 2));

  t.is(c1[0], t3);
  t.is(c1.length, 1);
  t.is(c2.length, 2);

  t.end();
});

test('categorizePoints separates points into shared and unique', t => {
  const p1 = new Point(0, 0);
  const p2 = new Point(-3, 8);
  const p3 = new Point(0, 10);
  const p4 = new Point(40, 40);
  const t1 = new Triangle(p1, p2, p3);
  const t3 = new Triangle(p1, p3, p4);
  const c = t1.categorizePoints(t3);

  t.is(c.shared.length, 2);
  t.is(c.unique.length, 2);

  t.end();
});

test('delaunayRemoveVertex', tester => {
  tester.test('removes vertex surrounded by 4 points, and validly retriangulates 4 points', t => {
    const mockDTGraph = new TGraph();
    const v0 = new Point(0, 0);
    const v1 = new Point(0, 10);
    const v2 = new Point(10, 10);
    const v3 = new Point(10, 0);
    const p = new Point(3, 6);
    mockDTGraph.addTriangle(new Triangle(p, v0, v1));
    mockDTGraph.addTriangle(new Triangle(p, v1, v2));
    mockDTGraph.addTriangle(new Triangle(p, v2, v3));
    mockDTGraph.addTriangle(new Triangle(p, v3, v0));
    mockDTGraph.delaunayRemoveVertex(p);

    t.is(mockDTGraph.triangles.size, 2);
    t.is(mockDTGraph.getVertices().length, 4);
    t.is(mockDTGraph.getEdges().length, 5);
    // One of the diagonals is connected
    t.true(mockDTGraph.isConnected(v0, v2) !== mockDTGraph.isConnected(v1, v3));

    t.end();
  });

  tester.test('removes vertex surrounded by 5 points', t => {
    const mockDTGraph = new TGraph();
    const v0 = new Point(0, 0);
    const v1 = new Point(0, 10);
    const v2 = new Point(10, 10);
    const v3 = new Point(10, 0);
    const v4 = new Point(-3, 5);
    const p = new Point(3, 6);
    mockDTGraph.addTriangle(new Triangle(p, v0, v4));
    mockDTGraph.addTriangle(new Triangle(p, v4, v1));
    mockDTGraph.addTriangle(new Triangle(p, v1, v2));
    mockDTGraph.addTriangle(new Triangle(p, v2, v3));
    mockDTGraph.addTriangle(new Triangle(p, v3, v0));
    mockDTGraph.delaunayRemoveVertex(p);

    t.is(mockDTGraph.triangles.size, 3);
    t.is(mockDTGraph.getVertices().length, 5);
    t.is(mockDTGraph.getEdges().length, 7);
    // Triangle on the left of the square is connected
    t.true(mockDTGraph.isConnected(v0, v1));
    // One of the diagonals is connected
    t.true(mockDTGraph.isConnected(v0, v2) !== mockDTGraph.isConnected(v1, v3));

    t.end();
  });
});
