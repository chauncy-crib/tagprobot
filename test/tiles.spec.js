import test from 'tape';
import keys from 'lodash/keys';
import values from 'lodash/values';
import forEach from 'lodash/forEach';
import has from 'lodash/has';
import sinon from 'sinon';

import {
  computeTileInfo,
  propertyFromId,
  isTileType,
  __RewireAPI__ as TileRewireAPI,
} from '../src/tiles';

// functions for setup and teardown tests begin here

export function setupTiles(myColorIsBlue) {
  const mockTileInfo = {
    EMPTY_SPACE: { id: 0, traversable: false },
    SQUARE_WALL: { id: 1, traversable: false },
    ANGLE_WALL_1: { id: 1.1, traversable: false },
    ANGLE_WALL_2: { id: 1.2, traversable: false },
    ANGLE_WALL_3: { id: 1.3, traversable: false },
    ANGLE_WALL_4: { id: 1.4, traversable: false },
    REGULAR_FLOOR: { id: 2, traversable: true },
    RED_FLAG: { id: 3, traversable: true },
    RED_FLAG_TAKEN: { id: 3.1, traversable: true },
    BLUE_FLAG: { id: 4, traversable: true },
    BLUE_FLAG_TAKEN: { id: 4.1, traversable: true },
    SPEEDPAD_ACTIVE: { id: 5, traversable: false, radius: 15 },
    SPEEDPAD_INACTIVE: { id: '5.1', traversable: true },
    POWERUP_SUBGROUP: { id: 6, traversable: false, radius: 15 },
    JUKEJUICE: { id: 6.1, traversable: false, radius: 15 },
    ROLLING_BOMB: { id: 6.2, traversable: false, radius: 15 },
    TAGPRO: { id: 6.3, traversable: false, radius: 15 },
    MAX_SPEED: { id: 6.4, traversable: false, radius: 15 },
    SPIKE: { id: 7, traversable: false, radius: 14 },
    BUTTON: { id: 8, traversable: false, radius: 8 },
    INACTIVE_GATE: { id: 9, traversable: true },
    GREEN_GATE: { id: 9.1, traversable: false },
    RED_GATE: { id: 9.2, traversable: !myColorIsBlue },
    BLUE_GATE: { id: 9.3, traversable: myColorIsBlue },
    BOMB: { id: 10, traversable: false, radius: 15 },
    INACTIVE_BOMB: { id: '10.1', traversable: true },
    RED_TEAMTILE: { id: 11, traversable: true },
    BLUE_TEAMTILE: { id: 12, traversable: true },
    ACTIVE_PORTAL: { id: 13, traversable: false, radius: 15 },
    INACTIVE_PORTAL: { id: '13.1', traversable: true },
    SPEEDPAD_RED_ACTIVE: { id: 14, traversable: false, radius: 15 },
    SPEEDPAD_RED_INACTIVE: { id: 14.1, traversable: true },
    SPEEDPAD_BLUE_ACTIVE: { id: 15, traversable: false, radius: 15 },
    SPEEDPAD_BLUE_INACTIVE: { id: 15.1, traversable: true },
    YELLOW_FLAG: { id: 16, traversable: true },
    YELLOW_FLAG_TAKEN: { id: '16.1', traversable: true },
    RED_ENDZONE: { id: 17, traversable: true },
    BLUE_ENDZONE: { id: 18, traversable: true },
    RED_BALL: { id: 'redball', traversable: true },
    BLUE_BALL: { id: 'blueball', traversable: true },
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

test('computeTileInfo: stores info in tileInfo', t => {
  const mockTileInfo = {};
  const mockAmRed = sinon.stub().returns(false);
  const mockAmBlue = sinon.stub().returns(true);
  TileRewireAPI.__Rewire__('amBlue', mockAmBlue);
  TileRewireAPI.__Rewire__('amRed', mockAmRed);
  TileRewireAPI.__Rewire__('tileInfo', mockTileInfo);
  computeTileInfo();
  // Check that 40 tiles were stored
  t.is(keys(mockTileInfo).length, 40);
  // Check that all values in tileInfo have an id
  forEach(values(mockTileInfo), value => {
    t.true(has(value, 'id'));
  });
  t.is(mockTileInfo.SPEEDPAD_RED_ACTIVE.radius, 15);
  t.is(mockTileInfo.ANGLE_WALL_2.traversable, false);
  t.is(mockTileInfo.RED_GATE.traversable, false);
  t.is(mockTileInfo.BLUE_GATE.traversable, true);
  t.true(mockAmRed.calledOnce);
  t.true(mockAmBlue.calledOnce);
  t.end();
});


test('propertyFromId: returns correct properties', t => {
  setupTiles(true);
  t.is(propertyFromId(1, 'traversable'), false);
  t.is(propertyFromId(2, 'traversable'), true);
  t.is(propertyFromId(13, 'radius'), 15);
  teardownTiles();

  t.end();
});


test('propertyFromId: throws error given tileIds that don\'t exist', t => {
  setupTiles(true);
  t.throws(() => { propertyFromId(1.123, 'traversable'); });
  t.throws(() => { propertyFromId(-1, 'traversable'); });
  t.throws(() => { propertyFromId('potato', 'traversable'); });
  t.throws(() => { propertyFromId(undefined, 'traversable'); });
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

