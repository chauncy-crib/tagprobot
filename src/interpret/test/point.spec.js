import test from 'tape';

import { pointsOnSameSide } from '../../global/utils';
import { sortCounterClockwise } from '../utils';
import { Point } from '../class/Point';


test('sortCounterClockwise sorts points in counter-clockwise order', t => {
  let points = [
    new Point(-1, 1),
    new Point(1, 1),
    new Point(1, -1),
    new Point(-1, -1),
  ];
  t.same(sortCounterClockwise(points), [
    new Point(-1, 1),
    new Point(-1, -1),
    new Point(1, -1),
    new Point(1, 1),
  ]);

  points = [
    new Point(0, 1),
    new Point(1, -1),
    new Point(-1, -1),
  ];
  t.same(sortCounterClockwise(points), [
    new Point(-1, -1),
    new Point(1, -1),
    new Point(0, 1),
  ]);

  points = [
    new Point(0, 1),
    new Point(2, 1),
    new Point(1, 0),
  ];
  t.same(sortCounterClockwise(points), [
    new Point(0, 1),
    new Point(1, 0),
    new Point(2, 1),
  ]);

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
