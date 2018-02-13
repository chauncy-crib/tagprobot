import test from 'tape';

import { sortCounterClockwise, pointsOnSameSide, isTriangleIntersectingEdge } from '../utils';
import { Point } from '../class/Point';
import { Triangle } from '../class/Triangle';


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
});
