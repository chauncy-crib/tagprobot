import test from 'tape';
import sinon from 'sinon';
import { isLegal, Point } from '../../src/navmesh/graph';


test('isLegal', tester => {
  tester.test('returns true when oppositePoint outside circle', t => {
    const edge = { p1: new Point(0, 1), p2: new Point(2, 1) };
    const insertedPoint = new Point(1, 0);
    t.true(isLegal(insertedPoint, edge, new Point(1, -1)));
    t.true(isLegal(insertedPoint, edge, new Point(1, 2.1)));
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
    const edge = { p1: new Point(1, 0), p2: new Point(2, 1) };
    const insertedPoint = new Point(0, 1);
    t.true(isLegal(insertedPoint, edge, new Point(1, 2)));
    t.end();
  });
  tester.end();
});
