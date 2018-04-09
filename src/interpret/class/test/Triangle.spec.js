import test from 'tape';

import { Point } from '../Point';
import { Edge } from '../Edge';
import { Triangle } from '../Triangle';


test('categorizePoints separates points into shared and unique', t => {
  const p1 = new Point(0, 0);
  const p2 = new Point(-3, 8);
  const p3 = new Point(0, 10);
  const p4 = new Point(40, 40);
  const t1 = new Triangle(p1, p2, p3);
  const t3 = new Triangle(p1, p3, p4);
  const c = t1.categorizePoints(t3);

  t.is(c.shared.length, 2);
  t.true(c.myPoint.equals(p2));
  t.true(c.otherPoint.equals(p4));

  t.end();
});


test('Triangle.containsPoint()', tester => {
  tester.test('returns true when point is inside triangle', t => {
    const triangle = new Triangle(new Point(0, 0), new Point(2, 0), new Point(0, 2));
    t.true(triangle.containsPoint(new Point(1, 1)));
    t.end();
  });

  tester.test('returns false when point is outside triangle', t => {
    const triangle = new Triangle(new Point(0, 0), new Point(2, 0), new Point(0, 2));
    t.false(triangle.containsPoint(new Point(2, 2)));
    t.false(triangle.containsPoint(new Point(3, -1)));
    t.end();
  });

  tester.test('returns true when point lays on edge of triangle', t => {
    const triangle = new Triangle(new Point(0, 0), new Point(2, 0), new Point(0, 2));
    t.true(triangle.containsPoint(new Point(1, 0)));
    t.true(triangle.containsPoint(new Point(1, 1)));
    t.end();
  });

  tester.test('returns true when point is one of triangles 3 points', t => {
    const triangle = new Triangle(new Point(0, 0), new Point(2, 0), new Point(0, 2));
    t.true(triangle.containsPoint(new Point(2, 0)));
    t.end();
  });
});


test('Triangle.intersectsEdge()', tester => {
  tester.test('returns true when two edges intersect edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(3, -1), new Point(3, 1), new Point(4, 1));

    t.true(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns true when one edge intersects edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(3, -1), new Point(3, 1), new Point(5, 0));

    t.true(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns true when point touches edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(3, -1), new Point(3, 0), new Point(4, -1));

    t.true(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns false when only one point touches edge endpoint', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(3, -1), new Point(2, 0), new Point(4, -1));

    t.false(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns false when the edge is one of the triangle\'s edges', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(3, -1), new Point(2, 0), new Point(4, 0));

    t.false(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns false when one point touches edge endpoint, other in middle of edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(2, 0), new Point(3, 0), new Point(3, 1));

    t.false(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns false when two points lay inside the edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(6, 0));
    const triangle = new Triangle(new Point(3, 0), new Point(4, 0), new Point(3, 1));

    t.false(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns false when triangle is above edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(3, -1), new Point(3, -2), new Point(4, -1));

    t.false(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns false when triangle is below edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(3, 1), new Point(3, 2), new Point(4, 1));

    t.false(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns false when triangle is to the left of edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(0, 1), new Point(0, 2), new Point(1, 1));

    t.false(triangle.intersectsEdge(edge));

    t.end();
  });

  tester.test('returns false when triangle is to the right of edge', t => {
    const edge = new Edge(new Point(2, 0), new Point(4, 0));
    const triangle = new Triangle(new Point(5, 1), new Point(5, 2), new Point(6, 1));

    t.false(triangle.intersectsEdge(edge));

    t.end();
  });
});
