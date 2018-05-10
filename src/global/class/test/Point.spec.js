import test from 'tape';

import { Point } from '../../../global/class/Point';
import { Edge } from '../../../global/class/Edge';


test('Point.laysOnEdge()', tester => {
  tester.test('returns true when the point is inside edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(0, 3));

    t.true((new Point(1, 2)).laysOnEdge(edge));
    t.true((new Point(2, 1)).laysOnEdge(edge));

    t.end();
  });

  tester.test('returns true when the point is edge endpoint', t => {
    const edge = new Edge(new Point(3, 0), new Point(0, 3));

    t.true((new Point(3, 0)).laysOnEdge(edge));
    t.true((new Point(0, 3)).laysOnEdge(edge));

    t.end();
  });

  tester.test('returns false when the point does not lay on the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(0, 3));

    t.false((new Point(1, 1)).laysOnEdge(edge));
    t.false((new Point(2, 2)).laysOnEdge(edge));

    t.end();
  });
  tester.test('returns false the point is collinear with edge, but not coincident', t => {
    const edge = new Edge(new Point(3, 0), new Point(0, 3));

    t.false((new Point(-1, 4)).laysOnEdge(edge));
    t.false((new Point(4, -1)).laysOnEdge(edge));

    t.end();
  });
});
