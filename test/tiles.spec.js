import test from 'tape';

import {
  isTraversable,
  getCNTORadius,
  computeTileInfo,
  resetTileInfo,
  getId,
  __RewireAPI__ as TileRewireAPI,
} from '../src/tiles';

export function setupTiles(myColorIsBlue) {
  TileRewireAPI.__Rewire__('amBlue', () => myColorIsBlue);
  TileRewireAPI.__Rewire__('amRed', () => !myColorIsBlue);
  computeTileInfo();
}

export function teardownTiles() {
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
}

test('isTraversable: correctly returns true for varying inputs', t => {
  setupTiles(true);
  t.true(isTraversable(2)); // Regular floor
  t.true(isTraversable(3.1)); // taken red flag
  t.true(isTraversable(9)); // inactive gate
  t.true(isTraversable(17)); // red endzone
  teardownTiles();
  t.end();
});


test('isTraversable: correctly returns false for varying inputs', t => {
  setupTiles(true);
  t.false(isTraversable(0)); // Blank space
  t.false(isTraversable(1)); // square wall
  t.false(isTraversable(7)); // spike
  teardownTiles();
  t.end();
});


test('isTraversable: throws errors for invalid inputs', t => {
  setupTiles(true);
  t.throws(() => { isTraversable(1.123); });
  t.throws(() => { isTraversable(-1); });
  t.throws(() => { isTraversable('potato'); });
  t.throws(() => { isTraversable(undefined); });
  teardownTiles();
  t.end();
});

test('getCNTORadius: correctly returns for varying inputs', t => {
  setupTiles(true);
  t.is(getCNTORadius(getId('SPIKE')), 14);
  t.is(getCNTORadius(getId('BUTTON')), 8);
  teardownTiles();
  t.end();
});


test('getCNTORadius: throws errors for invalid inputs', t => {
  setupTiles(true);
  t.throws(() => { getCNTORadius(getId('STANDARD_FLOOR')); });
  t.throws(() => { getCNTORadius('banana'); });
  t.throws(() => { getCNTORadius(undefined); });
  teardownTiles();
  t.end();
});

