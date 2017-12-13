import test from 'tape';
import {
  determinant,
  isLegal,
  sortCounterClockwise,
  pointsOnSameSide,
  isTriangleIntersectingEdge,
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

test('triangulateRegion does not create flat triangle when points are in a line', t => {
  const tGraph = new TGraph();
  const p1 = new Point(1080, 640);
  const p2 = new Point(1200, 680);
  const p3 = new Point(1200, 720);
  const p4 = new Point(1200, 760);
  tGraph.addEdgeAndVertices(p1, p2);
  tGraph.addEdgeAndVertices(p2, p3);
  tGraph.addEdgeAndVertices(p3, p4);
  tGraph.addEdgeAndVertices(p4, p1);
  tGraph.addFixedEdge({ p1, p2: p4 });
  t.doesNotThrow(() => tGraph.triangulateRegion([p1, p2, p3, p4]));

  t.true(tGraph.findTriangle(p1, p4, p3) !== null);
  t.true(tGraph.findTriangle(p1, p2, p3) !== null);
  t.true(tGraph.findTriangle(p1, p4, p2) === null);

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


test('pointsOnSameSide()', tester => {
  tester.test('returns true when points are on the left side of the edge', t => {
    const edge = { p1: new Point(3, 0), p2: new Point(3, 1) };
    const p1 = new Point(0, 0);
    const p2 = new Point(0, 1);

    t.true(pointsOnSameSide(p1, p2, edge));

    t.end();
  });

  tester.test('returns true when points are on the right side of the edge', t => {
    const edge = { p1: new Point(3, 0), p2: new Point(3, 1) };
    const p1 = new Point(4, 0);
    const p2 = new Point(4, 1);

    t.true(pointsOnSameSide(p1, p2, edge));

    t.end();
  });

  tester.test('returns false when points are on opposite sides of the edge', t => {
    const edge = { p1: new Point(3, 0), p2: new Point(3, 1) };
    const p1 = new Point(0, 0);
    const p2 = new Point(4, 1);

    t.false(pointsOnSameSide(p1, p2, edge));

    t.end();
  });
  tester.end();
});

test('isTriangleIntersectingEdge()', tester => {
  tester.test('returns true when two edges intersect edge', t => {
    const edge = { p1: new Point(2, 0), p2: new Point(4, 0) };
    const triangle = new Triangle(new Point(3, -1), new Point(3, 1), new Point(4, 1));

    t.true(isTriangleIntersectingEdge(triangle, edge));

    t.end();
  });

  tester.test('returns true when one edge intersects edge', t => {
    const edge = { p1: new Point(2, 0), p2: new Point(4, 0) };
    const triangle = new Triangle(new Point(3, -1), new Point(3, 1), new Point(5, 0));

    t.true(isTriangleIntersectingEdge(triangle, edge));

    t.end();
  });

  tester.test('returns true when point touches edge', t => {
    const edge = { p1: new Point(2, 0), p2: new Point(4, 0) };
    const triangle = new Triangle(new Point(3, -1), new Point(3, 0), new Point(4, -1));

    t.true(isTriangleIntersectingEdge(triangle, edge));

    t.end();
  });

  tester.test('returns false when only one point touches edge endpoint', t => {
    const edge = { p1: new Point(2, 0), p2: new Point(4, 0) };
    const triangle = new Triangle(new Point(3, -1), new Point(2, 0), new Point(4, -1));

    t.false(isTriangleIntersectingEdge(triangle, edge));

    t.end();
  });

  tester.test('returns false when triangle is above edge', t => {
    const edge = { p1: new Point(2, 0), p2: new Point(4, 0) };
    const triangle = new Triangle(new Point(3, -1), new Point(3, -2), new Point(4, -1));

    t.false(isTriangleIntersectingEdge(triangle, edge));

    t.end();
  });

  tester.test('returns false when triangle is below edge', t => {
    const edge = { p1: new Point(2, 0), p2: new Point(4, 0) };
    const triangle = new Triangle(new Point(3, 1), new Point(3, 2), new Point(4, 1));

    t.false(isTriangleIntersectingEdge(triangle, edge));

    t.end();
  });

  tester.test('returns false when triangle is to the left of edge', t => {
    const edge = { p1: new Point(2, 0), p2: new Point(4, 0) };
    const triangle = new Triangle(new Point(0, 1), new Point(0, 2), new Point(1, 1));

    t.false(isTriangleIntersectingEdge(triangle, edge));

    t.end();
  });

  tester.test('returns false when triangle is to the right of edge', t => {
    const edge = { p1: new Point(2, 0), p2: new Point(4, 0) };
    const triangle = new Triangle(new Point(5, 1), new Point(5, 2), new Point(6, 1));

    t.false(isTriangleIntersectingEdge(triangle, edge));

    t.end();
  });

  tester.end();
});

