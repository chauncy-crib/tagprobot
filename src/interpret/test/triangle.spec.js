import test from 'tape';

import { Point } from '../class/Point';
import { Triangle, isTriangleIntersectingEdge } from '../class/Triangle';


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
