import sinon from 'sinon';

import { __RewireAPI__ as GameStateRewireAPI } from '../../look/gameState';
import { __RewireAPI__ as TileInfoRewireAPI } from '../../look/tileInfo';
import { __RewireAPI__ as MapToGraphRewireAPI } from '../mapToGraph';


/**
 * A fake for the purpose of rewiring tileHasName to handle angle walls in unit-tests correctly.
 */
function fakeTileHasName(id, name) {
  if (id === 1.1 && name === 'ANGLE_WALL_1') return true;
  if (id === 1.2 && name === 'ANGLE_WALL_2') return true;
  if (id === 1.3 && name === 'ANGLE_WALL_3') return true;
  if (id === 1.4 && name === 'ANGLE_WALL_4') return true;
  return false;
}


export function setup() {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.returns(false);
  const mockTileHasName = sinon.stub().callsFake(fakeTileHasName);
  MapToGraphRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
  GameStateRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
  GameStateRewireAPI.__Rewire__('tileHasName', mockTileHasName);
  TileInfoRewireAPI.__Rewire__('tileHasName', mockTileHasName);
}


export function teardown() {
  MapToGraphRewireAPI.__ResetDependency__('getTileProperty');
  GameStateRewireAPI.__ResetDependency__('getTileProperty');
  GameStateRewireAPI.__ResetDependency__('tileHasName');
  TileInfoRewireAPI.__ResetDependency__('tileHasName');
}
