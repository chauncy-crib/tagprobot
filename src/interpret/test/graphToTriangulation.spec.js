import test from 'tape';

import { Point } from '../class/Point';
import { isLegal } from '../graphToTriangulation';

test('isLegal', tester => {
  tester.test('returns true when oppositePoint outside circle', t => {
    let edge = { p1: new Point(0, 1), p2: new Point(2, 1) };
    let insertedPoint = new Point(1, 0);
    t.true(isLegal(insertedPoint, edge, new Point(1, -1)));
    t.true(isLegal(insertedPoint, edge, new Point(1, 2.1)));

    insertedPoint = new Point(1320, 1160);
    edge = { p1: new Point(1000, 1160), p2: new Point(14000000, 10000000) };
    t.true(isLegal(insertedPoint, edge, new Point(-3000000, -100)));

    insertedPoint = new Point(1160, 520);
    edge = { p1: new Point(80, 1560), p2: new Point(14000000, 10000000) };
    t.true(isLegal(insertedPoint, edge, new Point(-3000000, -100)));

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
    let edge = { p1: new Point(1, 0), p2: new Point(2, 1) };
    let insertedPoint = new Point(0, 1);
    t.true(isLegal(insertedPoint, edge, new Point(1, 2)));

    insertedPoint = new Point(840, 1480);
    edge = { p1: new Point(1000, 1360), p2: new Point(680, 1320) };
    t.true(isLegal(insertedPoint, edge, new Point(800, 1160)));

    t.end();
  });
});
