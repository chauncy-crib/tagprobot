import test from 'tape';

import { Point } from '../Point';
import { Edge } from '../Edge';


test('Point.laysOnEdge()', tester => {
  tester.test('returns true when the point lays on the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(0, 3));

    t.true((new Point(1, 2)).laysOnEdge(edge));
    t.true((new Point(2, 1)).laysOnEdge(edge));
    t.true((new Point(3, 0)).laysOnEdge(edge));
    t.true((new Point(0, 3)).laysOnEdge(edge));

    t.end();
  });

  tester.test('returns false when the point does not lay on the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(0, 3));

    t.false((new Point(1, 1)).laysOnEdge(edge));
    t.false((new Point(2, 2)).laysOnEdge(edge));
    t.false((new Point(-1, 4)).laysOnEdge(edge));
    t.false((new Point(4, -1)).laysOnEdge(edge));

    t.end();
  });
});
