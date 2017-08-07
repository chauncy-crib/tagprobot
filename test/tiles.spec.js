import test from 'tape';
import keys from 'lodash/keys';

import {
  getTileProperty,
  isTraversable,
  getCNTORadius,
  getTileId,
  isTileType,
  __RewireAPI__ as TileRewireAPI,
} from '../src/tiles';

// functions for setup and teardown tests begin here

export function setupTiles(myColorIsBlue) {
  const mockTileInfo = {
    EMPTY_SPACE: { id: 0, traversable: false, permanent: true },
    SQUARE_WALL: { id: 1, traversable: false, permanent: true },
    ANGLE_WALL_1: { id: 1.1, traversable: false, permanent: true },
    ANGLE_WALL_2: { id: 1.2, traversable: false, permanent: true },
    ANGLE_WALL_3: { id: 1.3, traversable: false, permanent: true },
    ANGLE_WALL_4: { id: 1.4, traversable: false, permanent: true },
    REGULAR_FLOOR: { id: 2, traversable: true, permanent: true },
    RED_FLAG: { id: 3, traversable: true, permanent: false },
    RED_FLAG_TAKEN: { id: 3.1, traversable: true, permanent: false },
    BLUE_FLAG: { id: 4, traversable: true, permanent: false },
    BLUE_FLAG_TAKEN: { id: 4.1, traversable: true, permanent: false },
    SPEEDPAD_ACTIVE: { id: 5, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_INACTIVE: { id: '5.1', traversable: true, permanent: false },
    POWERUP_SUBGROUP: { id: 6, traversable: false, radius: 15, permanent: false },
    JUKEJUICE: { id: 6.1, traversable: false, radius: 15, permanent: false },
    ROLLING_BOMB: { id: 6.2, traversable: false, radius: 15, permanent: false },
    TAGPRO: { id: 6.3, traversable: false, radius: 15, permanent: false },
    MAX_SPEED: { id: 6.4, traversable: false, radius: 15, permanent: false },
    SPIKE: { id: 7, traversable: false, radius: 14, permanent: true },
    BUTTON: { id: 8, traversable: false, radius: 8, permanent: true },
    INACTIVE_GATE: { id: 9, traversable: true, permanent: false },
    GREEN_GATE: { id: 9.1, traversable: false, permanent: false },
    RED_GATE: { id: 9.2, traversable: !myColorIsBlue, permanent: false },
    BLUE_GATE: { id: 9.3, traversable: myColorIsBlue, permanent: false },
    BOMB: { id: 10, traversable: false, radius: 15, permanent: false },
    INACTIVE_BOMB: { id: '10.1', traversable: true, permanent: false },
    RED_TEAMTILE: { id: 11, traversable: true, permanent: true },
    BLUE_TEAMTILE: { id: 12, traversable: true, permanent: true },
    ACTIVE_PORTAL: { id: 13, traversable: false, radius: 15, permanent: false },
    INACTIVE_PORTAL: { id: '13.1', traversable: true, permanent: false },
    SPEEDPAD_RED_ACTIVE: { id: 14, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_RED_INACTIVE: { id: 14.1, traversable: true, permanent: false },
    SPEEDPAD_BLUE_ACTIVE: { id: 15, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_BLUE_INACTIVE: { id: 15.1, traversable: true, permanent: false },
    YELLOW_FLAG: { id: 16, traversable: true, permanent: false },
    YELLOW_FLAG_TAKEN: { id: '16.1', traversable: true, permanent: false },
    RED_ENDZONE: { id: 17, traversable: true, permanent: true },
    BLUE_ENDZONE: { id: 18, traversable: true, permanent: true },
    RED_BALL: { id: 'redball', traversable: true, permanent: false },
    BLUE_BALL: { id: 'blueball', traversable: true, permanent: false },
  };
  const mockTileNames = {};
  keys(mockTileInfo).forEach(key => {
    mockTileNames[mockTileInfo[key].id] = key;
  });
  TileRewireAPI.__Rewire__('tileInfo', mockTileInfo);
  TileRewireAPI.__Rewire__('tileNames', mockTileNames);
}

export function teardownTiles() {
  TileRewireAPI.__ResetDependency__('tileInfo');
  TileRewireAPI.__ResetDependency__('tileNames');
}

// begin actual tests

test('getTileProperty: returns correct properties', t => {
  setupTiles(true);
  t.is(getTileProperty(1, 'traversable'), false);
  t.is(getTileProperty(2, 'traversable'), true);
  t.is(getTileProperty(13, 'radius'), 15);
  teardownTiles();

  t.end();
});


test('getTileProperty: throws error given tileIds that don\'t exist', t => {
  setupTiles(true);
  t.throws(() => { getTileProperty(1.123, 'traversable'); });
  t.throws(() => { getTileProperty(-1, 'traversable'); });
  t.throws(() => { getTileProperty('potato', 'traversable'); });
  t.throws(() => { getTileProperty(undefined, 'traversable'); });
  teardownTiles();

  t.end();
});


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
  t.is(getCNTORadius(getTileId('SPIKE')), 14);
  t.is(getCNTORadius(getTileId('BUTTON')), 8);
  teardownTiles();

  t.end();
});


test('getCNTORadius: throws errors for invalid inputs', t => {
  setupTiles(true);
  t.throws(() => { getCNTORadius(getTileId('STANDARD_FLOOR')); });
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

