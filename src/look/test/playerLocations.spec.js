import test from 'tape';

import { BRP } from '../../global/constants';
import { playerIsNearPoint } from '../playerLocations';
import { Point } from '../../global/class/Point';


test('playerIsNearPoint', tester => {
  tester.test('returns false if player does not have x attribute', t => {
    const mockPlayer = { y: 0 - BRP }; // BRP offset to go from center to top-left
    const point = new Point(0, 0);

    t.false(playerIsNearPoint(mockPlayer, point));

    t.end();
  });

  tester.test('returns false if player does not have y attribute', t => {
    const mockPlayer = { x: 0 - BRP }; // BRP offset to go from center to top-left
    const point = new Point(0, 0);

    t.false(playerIsNearPoint(mockPlayer, point));

    t.end();
  });

  tester.test('returns false if player not near point', t => {
    const mockPlayer = { x: 301 - BRP, y: 0 - BRP }; // BRP offset to go from center to top-left
    const point = new Point(0, 0);

    t.is(playerIsNearPoint(mockPlayer, point), false);

    t.end();
  });

  tester.test('returns true if player near point', t => {
    const mockPlayer = { x: 300 - BRP, y: 0 - BRP }; // BRP offset to go from center to top-left
    const point = new Point(0, 0);

    t.is(playerIsNearPoint(mockPlayer, point), true);

    t.end();
  });

  tester.test('returns false if player not near point, with specified threshold', t => {
    const mockPlayer = { x: 2 - BRP, y: 0 - BRP }; // BRP offset to go from center to top-left
    const point = new Point(0, 0);
    const threshold = 1;

    t.is(playerIsNearPoint(mockPlayer, point, threshold), false);

    t.end();
  });

  tester.test('returns true if player near point, with specified threshold', t => {
    const mockPlayer = { x: 999 - BRP, y: 0 - BRP }; // BRP offset to go from center to top-left
    const point = new Point(0, 0);
    const threshold = 1000;

    t.is(playerIsNearPoint(mockPlayer, point, threshold), true);

    t.end();
  });
});
