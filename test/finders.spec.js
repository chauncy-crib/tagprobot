import test from 'tape';
import { findTile } from '../src/helpers/finders';
import { setupTiles, teardownTiles } from './tiles.spec';
import { getTileId } from '../src/tiles';
import { teams, PPTL } from '../src/constants';


test('findTile: returns correctly with orthogonal inputs', t => {
  setupTiles(teams.BLUE);

  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = getTileId('BOMB');
  const spike = getTileId('SPIKE');
  const redgate = getTileId('RED_GATE');
  const bluegate = getTileId('BLUE_GATE');
  const blank = getTileId('REGULAR_FLOOR');

  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  global.tagpro.map = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */

  t.same(findTile(bomb), { x: 0 * PPTL, y: 0 * PPTL });
  t.same(findTile(redgate), { x: 0 * PPTL, y: 2 * PPTL });
  t.same(findTile(spike), { x: 2 * PPTL, y: 1 * PPTL });

  teardownTiles();

  t.end();
});
