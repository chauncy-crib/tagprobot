import test from 'tape';

import { playerIsNearPoint } from '../playerLocations';
import { Point } from '../../interpret/class/Point';


test('playerIsNearPoint', tester => {
  tester.test('returns false if player does not have x attribute', t => {
    const mockPlayer = { y: 0 };
    const point = new Point(0, 0);

    t.is(playerIsNearPoint(mockPlayer, point), false);

    t.end();
  });

  tester.test('returns false if player not near point', t => {
    const mockPlayer = { x: 401, y: 0 };
    const point = new Point(0, 0);

    t.is(playerIsNearPoint(mockPlayer, point), false);

    t.end();
  });

  tester.test('returns true if player near point', t => {
    const mockPlayer = { x: 400, y: 0 };
    const point = new Point(0, 0);

    t.is(playerIsNearPoint(mockPlayer, point), true);

    t.end();
  });
});
