import test from 'tape';

import { assert, assertGridInBounds, pointsOnSameSide } from '../utils';
import { Point } from '../../interpret/class/Point';


test('assert: does not throw errors with condition=true', t => {
  const condition = true;
  t.doesNotThrow(() => { assert(condition); });

  t.end();
});


test('assert: throws errors with condition=false', t => {
  const condition = false;
  t.throws(() => { assert(condition); });

  t.end();
});


test('assertGridInBounds: does not throw errors when inputs are in bounds', t => {
  const arr = [[0, 0, 0], [0, 0, 0]]; // a 2x3 array
  t.doesNotThrow(() => { assertGridInBounds(arr, 1, 1); });

  t.end();
});


test('assertGridInBounds: throws errors when inputs are not in bounds', t => {
  const arr = [[0, 0, 0], [0, 0, 0]]; // a 2x3 array
  t.throws(() => { assertGridInBounds(arr, -1, 0); });
  t.throws(() => { assertGridInBounds(arr, 2, 0); });
  t.throws(() => { assertGridInBounds(arr, 1, -1); });
  t.throws(() => { assertGridInBounds(arr, 1, 4); });

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
  tester.end();
});
