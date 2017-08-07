import test from 'tape';

import {
  isTraversable,
  getCNTORadius,
  computeTileInfo,
  resetTileInfo,
  getId,
  isTileType,
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


test('isTileType: returns true when tileId and name match', t => {
  setupTiles(true);
  t.ok(isTileType(1.1, 'ANGLE_WALL_1'));
  t.ok(isTileType(4, 'BLUE_FLAG'));
  t.ok(isTileType('5.1', 'SPEEDPAD_INACTIVE'));
  t.ok(isTileType('16.1', 'YELLOW_FLAG_TAKEN'));
  t.ok(isTileType(18, 'BLUE_ENDZONE'));
  teardownTiles();
  t.end();
});


test('isTileType: returns false when tileId and name do not match', t => {
  setupTiles(true);
  t.notOk(isTileType(1, 'ANGLE_WALL_1'));
  t.notOk(isTileType(4, 'RED_FLAG'));
  t.notOk(isTileType(5.1, 'SPEEDPAD_INACTIVE'));
  t.notOk(isTileType('16', 'YELLOW_FLAG_TAKEN'));
  t.notOk(isTileType(17, 'BLUE_ENDZONE'));
  teardownTiles();
  t.end();
});


test('isTileType: errors when name is not a tile', t => {
  setupTiles(true);
  t.throws(() => { isTileType(1, undefined); });
  t.throws(() => { isTileType(1, 'potato'); });
  t.throws(() => { isTileType(1, 'toid'); });
  t.throws(() => { isTileType(1, ''); });
  t.throws(() => { isTileType(1, 1); });
  teardownTiles();
  t.end();
});
