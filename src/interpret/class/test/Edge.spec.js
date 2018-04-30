import test from 'tape';

import { Point } from '../Point';
import { Edge } from '../Edge';


test('Edge.isBetweenPoints()', tester => {
  tester.test('returns true when points are on the left side of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(0, 0);
    const p2 = new Point(0, 1);

    t.false(edge.isBetweenPoints(p1, p2));

    t.end();
  });

  tester.test('returns true when points are on the right side of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(4, 0);
    const p2 = new Point(4, 1);

    t.false(edge.isBetweenPoints(p1, p2));

    t.end();
  });

  tester.test('returns strict behavior when one point is coincident with edge', t => {
    const edge = new Edge(new Point(3, 3), new Point(5, 5));
    const p1 = new Point(4, 4);
    const p2 = new Point(5, 4);

    t.false(edge.isBetweenPoints(p1, p2, true));
    t.true(edge.isBetweenPoints(p1, p2, false));

    t.end();
  });

  tester.test('returns strict behavior when one point is collinear with edge', t => {
    const edge = new Edge(new Point(3, 3), new Point(5, 5));
    const p1 = new Point(2, 2);
    const p2 = new Point(2, 3);

    t.false(edge.isBetweenPoints(p1, p2, true));
    t.true(edge.isBetweenPoints(p1, p2, false));

    t.end();
  });

  tester.test('returns strict behavior when one point is an edge endpoint', t => {
    const edge = new Edge(new Point(3, 3), new Point(5, 5));
    const p1 = new Point(3, 3);
    const p2 = new Point(3, 5);

    t.false(edge.isBetweenPoints(p1, p2, true));
    t.true(edge.isBetweenPoints(p1, p2, false));

    t.end();
  });

  tester.test('returns false when points are on opposite sides of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(0, 0);
    const p2 = new Point(4, 1);

    t.true(edge.isBetweenPoints(p1, p2));

    t.end();
  });
});


test('Edge.overlapsEdge()', tester => {
  tester.test('returns true when edges overlap', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    let e2 = new Edge(new Point(4, 1), new Point(5, 2));
    t.true(e1.overlapsEdge(e2));

    e2 = new Edge(new Point(4, 1), new Point(6, 3));
    t.true(e1.overlapsEdge(e2));

    e2 = new Edge(new Point(4, 1), new Point(7, 4));
    t.true(e1.overlapsEdge(e2));

    e2 = new Edge(new Point(6, 3), new Point(7, 4));
    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns false when edges do not overlap', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    let e2 = new Edge(new Point(4, 1), new Point(5, 1));
    t.false(e1.overlapsEdge(e2));

    e2 = new Edge(new Point(4, 1), new Point(6, 2));
    t.false(e1.overlapsEdge(e2));

    e2 = new Edge(new Point(7, 4), new Point(8, 5));
    t.false(e1.overlapsEdge(e2));

    t.end();
  });
});

