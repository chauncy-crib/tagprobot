import sinon from 'sinon';
import { computeTileInfo, __RewireAPI__ as TileRewireAPI } from '../../look/tileInfo';

export function setupTiles() {
  TileRewireAPI.__Rewire__('amBlue', sinon.stub().returns(true));
  TileRewireAPI.__Rewire__('amRed', sinon.stub().returns(false));
  TileRewireAPI.__Rewire__('tileInfo', {});
  TileRewireAPI.__Rewire__('tileNames', {});
  computeTileInfo();
}

export function teardownTiles() {
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  TileRewireAPI.__ResetDependency__('tileInfo');
  TileRewireAPI.__ResetDependency__('tileNames');
}
