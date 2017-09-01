import test from 'tape';
import { findTile } from '../../src/helpers/finders';
import { setupTiles, teardownTiles } from '../tiles.spec';
import { teams, PPTL } from '../../src/constants';


test('findTile: returns correctly with orthogonal inputs', t => {
  setupTiles(teams.BLUE);

  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = 10;
  const spike = 7;
  const redGate = 9.2;
  const blueGate = 9.3;
  const floor = 2;

  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  global.tagpro = {
    map: [
      [bomb,    floor,    redGate],
      [redGate, blueGate, floor  ],
      [floor,   spike,    bomb   ],
    ],
  };

  /* eslint-enable no-multi-spaces, array-bracket-spacing */

  t.same(findTile('BOMB'), { x: 0 * PPTL, y: 0 * PPTL });
  t.same(findTile('RED_GATE'), { x: 0 * PPTL, y: 2 * PPTL });
  t.same(findTile('SPIKE'), { x: 2 * PPTL, y: 1 * PPTL });

  teardownTiles();

  t.end();
});
