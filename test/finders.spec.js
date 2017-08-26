import test from 'tape';
import { findTile } from '../src/helpers/finders';
import { setupTiles, teardownTiles } from './tiles.spec';
import { getTileId } from '../src/tiles';
import { PPTL } from '../src/constants';


test('findTile: returns correctly with orthogonal inputs', t => {
  setupTiles(true);

  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = getTileId('BOMB');
  const spike = getTileId('SPIKE');
  const redgate = getTileId('RED_GATE');
  const bluegate = getTileId('BLUE_GATE');
  const blank = getTileId('REGULAR_FLOOR');

  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockMap = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */

  t.same(findTile(mockMap, bomb), { x: 0 * PPTL, y: 0 * PPTL });
  t.same(findTile(mockMap, redgate), { x: 0 * PPTL, y: 2 * PPTL });
  t.same(findTile(mockMap, spike), { x: 2 * PPTL, y: 1 * PPTL });

  teardownTiles();

  t.end();
});
