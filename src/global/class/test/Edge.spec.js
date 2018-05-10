import test from 'tape';

import { Point } from '../Point';
import { Edge } from '../Edge';
import { isRoughly } from '../../utils';


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
  tester.test('returns true when one edge contains the other', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(4, 1), new Point(5, 2));

    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns true when one point in the middle of edge, other is shared endpoint', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(4, 1), new Point(6, 3));

    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns true one point inside edge, other is not', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(4, 1), new Point(7, 4));

    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns true one edge ends where the other begins', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(6, 3), new Point(7, 4));

    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns false edge point is on other edge, but edges are not collinear', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    let e2 = new Edge(new Point(4, 1), new Point(5, 1));

    t.false(e1.overlapsEdge(e2));

    e2 = new Edge(new Point(4, 1), new Point(6, 2));
    t.false(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns false when edges are collinear but not coincident', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(7, 4), new Point(8, 5));

    t.false(e1.overlapsEdge(e2));

    t.end();
  });
});


test('Edge.getProjectedPoint()', tester => {
  tester.test('returns correct point when edge is horizontal', t => {
    const e = new Edge(new Point(0, 0), new Point(10, 0));

    t.true(e.getProjectedPoint(new Point(3, 0)).equals(new Point(3, 0)));
    t.true(e.getProjectedPoint(new Point(3, 2)).equals(new Point(3, 0)));
    t.true(e.getProjectedPoint(new Point(11, 5)).equals(new Point(11, 0)));

    t.end();
  });

  tester.test('returns correct point when edge is vertical', t => {
    const e = new Edge(new Point(0, 0), new Point(0, 10));

    t.true(e.getProjectedPoint(new Point(0, 3)).equals(new Point(0, 3)));
    t.true(e.getProjectedPoint(new Point(3, 3)).equals(new Point(0, 3)));

    t.end();
  });

  tester.test('returns correct point when edge is 45 degrees', t => {
    const e = new Edge(new Point(0, 0), new Point(10, 10));

    t.true(e.getProjectedPoint(new Point(5, 5)).equals(new Point(5, 5)));
    t.true(e.getProjectedPoint(new Point(2, 5)).equals(new Point(3.5, 3.5)));
    t.true(e.getProjectedPoint(new Point(7, 2)).equals(new Point(4.5, 4.5)));

    t.end();
  });

  tester.test('returns correct point when edge is 30 degrees', t => {
    const e = new Edge(new Point(0, 0), new Point(20, 10));

    t.true(e.getProjectedPoint(new Point(5, 5)).equals(new Point(6, 3)));
    t.true(e.getProjectedPoint(new Point(9, 5)).equals(new Point(9.2, 4.6)));

    t.end();
  });
});


test('Edge.distToPoint()', tester => {
  tester.test('returns correct distance when point projection is on edge', t => {
    let e = new Edge(new Point(0, 0), new Point(10, 0));

    t.is(e.distToPoint(new Point(4, 5)), 5);
    t.is(e.distToPoint(new Point(5, 0)), 0);

    e = new Edge(new Point(0, 0), new Point(10, 10));

    t.true(isRoughly(e.distToPoint(new Point(4, 5)), 0.7071)); // should be 1/sqrt(2)
    t.true(isRoughly(e.distToPoint(new Point(1, 5)), 2.828)); // should be 4/sqrt(2)

    t.end();
  });

  tester.test('returns correct distance when point projection is not on edge', t => {
    let e = new Edge(new Point(0, 0), new Point(10, 0));
    t.true(isRoughly(e.distToPoint(new Point(15, 5)), 7.071)); // should be 7*sqrt(2)

    e = new Edge(new Point(0, 0), new Point(10, 10));
    t.true(isRoughly(e.distToPoint(new Point(12, 12)), 2.828)); // 2 * sqrt(2)

    t.end();
  });
});
