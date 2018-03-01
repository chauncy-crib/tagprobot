import test from 'tape';

import { Point } from '../Point';
import { Edge } from '../Edge';


test('Edge.isOnSameSideOfPoints()', tester => {
  tester.test('returns true when points are on the left side of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(0, 0);
    const p2 = new Point(0, 1);

    t.true(edge.onSameSideOfPoints(p1, p2));

    t.end();
  });

  tester.test('returns true when points are on the right side of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(4, 0);
    const p2 = new Point(4, 1);

    t.true(edge.onSameSideOfPoints(p1, p2));

    t.end();
  });

  tester.test('returns false when points are on opposite sides of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(0, 0);
    const p2 = new Point(4, 1);

    t.false(edge.onSameSideOfPoints(p1, p2));

    t.end();
  });
});
