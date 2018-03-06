import test from 'tape';

import { Point } from '../class/Point';
import { Edge } from '../class/Edge';
import { isLegal } from '../graphToTriangulation';

test('isLegal', tester => {
  tester.test('returns true when oppositePoint outside circle', t => {
    let edge = new Edge(new Point(0, 1), new Point(2, 1));
    let insertedPoint = new Point(1, 0);
    t.true(isLegal(insertedPoint, edge, new Point(1, -1)));
    t.true(isLegal(insertedPoint, edge, new Point(1, 2.1)));

    insertedPoint = new Point(1320, 1160);
    edge = new Edge(new Point(1000, 1160), new Point(14000000, 10000000));
    t.true(isLegal(insertedPoint, edge, new Point(-3000000, -100)));

    insertedPoint = new Point(1160, 520);
    edge = new Edge(new Point(80, 1560), new Point(14000000, 10000000));
    t.true(isLegal(insertedPoint, edge, new Point(-3000000, -100)));

    t.end();
  });

  tester.test('returns false when oppositePoint inside circle', t => {
    const edge = new Edge(new Point(1, 0), new Point(2, 1));
    const insertedPoint = new Point(0, 1);

    t.false(isLegal(insertedPoint, edge, new Point(1, 1)));
    t.false(isLegal(insertedPoint, edge, new Point(0.1, 1)));

    t.end();
  });

  tester.test('returns true when oppositePoint on circle', t => {
    let edge = new Edge(new Point(1, 0), new Point(2, 1));
    let insertedPoint = new Point(0, 1);
    t.true(isLegal(insertedPoint, edge, new Point(1, 2)));

    insertedPoint = new Point(840, 1480);
    edge = new Edge(new Point(1000, 1360), new Point(680, 1320));
    t.true(isLegal(insertedPoint, edge, new Point(800, 1160)));

    t.end();
  });
});
