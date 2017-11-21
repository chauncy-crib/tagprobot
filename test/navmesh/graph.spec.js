import test from 'tape';
import { isLegal, sortCounterClockwise, Point, Triangle, TGraph } from '../../src/navmesh/graph';


test('isLegal', tester => {
  tester.test('returns true when oppositePoint outside circle', t => {
    const edge = { p1: new Point(0, 1), p2: new Point(2, 1) };
    const insertedPoint = new Point(1, 0);

    t.true(isLegal(insertedPoint, edge, new Point(1, -1)));
    t.true(isLegal(insertedPoint, edge, new Point(1, 2.1)));

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
    const edge = { p1: new Point(1, 0), p2: new Point(2, 1) };
    const insertedPoint = new Point(0, 1);

    t.true(isLegal(insertedPoint, edge, new Point(1, 2)));

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
