import test from 'tape';
import sinon from 'sinon';
import { findTile, __RewireAPI__ as FinderRewireAPI } from '../../src/helpers/finders';
import { PPTL } from '../../src/constants';


test('findTile: returns correctly with orthogonal inputs', t => {
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

  const mockTileHasName = sinon.stub();
  mockTileHasName.withArgs(bomb, 'BOMB').returns(true);
  mockTileHasName.withArgs(redGate, 'RED_GATE').returns(true);
  mockTileHasName.withArgs(spike, 'SPIKE').returns(true);
  mockTileHasName.returns(false);

  FinderRewireAPI.__Rewire__('tileHasName', mockTileHasName);

  t.same(findTile('BOMB'), { x: 0 * PPTL, y: 0 * PPTL });
  t.same(findTile('RED_GATE'), { x: 0 * PPTL, y: 2 * PPTL });
  t.same(findTile('SPIKE'), { x: 2 * PPTL, y: 1 * PPTL });

  FinderRewireAPI.__ResetDependency__('tileHasName');

  t.end();
});
