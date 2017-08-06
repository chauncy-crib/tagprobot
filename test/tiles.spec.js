import test from 'tape';

import {
  isTraversable,
  getCNTORadius,
  computeTileInfo,
  resetTileInfo,
  getId,
  __RewireAPI__ as TileRewireAPI,
} from '../src/tiles';

test('isTraversable: correctly returns true for varying inputs', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  t.true(isTraversable(2)); // Regular floor
  t.true(isTraversable(3.1)); // taken red flag
  t.true(isTraversable(9)); // inactive gate
  t.true(isTraversable(17)); // red endzone
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('isTraversable: correctly returns false for varying inputs', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  t.false(isTraversable(0)); // Blank space
  t.false(isTraversable(1)); // square wall
  t.false(isTraversable(7)); // spike
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();

  t.end();
});


test('isTraversable: throws errors for invalid inputs', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  t.throws(() => { isTraversable(1.123); });
  t.throws(() => { isTraversable(-1); });
  t.throws(() => { isTraversable('potato'); });
  t.throws(() => { isTraversable(undefined); });
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();

  t.end();
});

test('getCNTORadius: correctly returns for varying inputs', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  t.is(getCNTORadius(getId('SPIKE')), 14);
  t.is(getCNTORadius(getId('BUTTON')), 8);
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getCNTORadius: throws errors for invalid inputs', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  t.throws(() => { getCNTORadius(getId('STANDARD_FLOOR')); });
  t.throws(() => { getCNTORadius('banana'); });
  t.throws(() => { getCNTORadius(undefined); });
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});

