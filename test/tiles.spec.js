import test from 'tape';
import keys from 'lodash/keys';
import values from 'lodash/values';
import forEach from 'lodash/forEach';
import has from 'lodash/has';
import sinon from 'sinon';
import _ from 'lodash';

import {
  computeTileInfo,
  getTileProperty,
  tileHasName,
  tileHasProperty,
  tileIsOneOf,
  __RewireAPI__ as TileRewireAPI,
} from '../src/tiles';
import { teams } from '../src/constants';
import { assert } from '../src/utils/asserts';

// functions for setup and teardown tests begin here

/*
 * @param {number} teamColor - 1 for red, 2 for blue
 */
export function setupTiles(teamColor) {
  assert(_.includes([teams.RED, teams.BLUE], teamColor), `${teamColor} is not a team color`);
  const mockTileInfo = {
    EMPTY_SPACE: { id: 0, traversable: false, permanent: true },
    SQUARE_WALL: { id: 1, traversable: false, permanent: true },
    ANGLE_WALL_1: { id: 1.1, traversable: false, permanent: true },
    ANGLE_WALL_2: { id: 1.2, traversable: false, permanent: true },
    ANGLE_WALL_3: { id: 1.3, traversable: false, permanent: true },
    ANGLE_WALL_4: { id: 1.4, traversable: false, permanent: true },
    REGULAR_FLOOR: { id: 2, traversable: true, permanent: true },
    RED_FLAG: { id: 3, traversable: true, permanent: false },
    RED_FLAG_TAKEN: { id: '3.1', traversable: true, permanent: false },
    BLUE_FLAG: { id: 4, traversable: true, permanent: false },
    BLUE_FLAG_TAKEN: { id: '4.1', traversable: true, permanent: false },
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
    RED_GATE: { id: 9.2, traversable: teamColor === teams.RED, permanent: false },
    BLUE_GATE: { id: 9.3, traversable: teamColor === teams.BLUE, permanent: false },
    BOMB: { id: 10, traversable: false, radius: 15, permanent: false },
    INACTIVE_BOMB: { id: '10.1', traversable: true, permanent: false },
    RED_TEAMTILE: { id: 11, traversable: true, permanent: true },
    BLUE_TEAMTILE: { id: 12, traversable: true, permanent: true },
    ACTIVE_PORTAL: { id: 13, traversable: false, radius: 15, permanent: false },
    INACTIVE_PORTAL: { id: '13.1', traversable: true, permanent: false },
    SPEEDPAD_RED_ACTIVE: { id: 14, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_RED_INACTIVE: { id: '14.1', traversable: true, permanent: false },
    SPEEDPAD_BLUE_ACTIVE: { id: 15, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_BLUE_INACTIVE: { id: '15.1', traversable: true, permanent: false },
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

function setup() {
  TileRewireAPI.__Rewire__('tileInfo', {
    NAME_1: { id: 1, a: '1', b: '2' },
    NAME_2: { id: '2', c: '3', d: '4' },
  });
  TileRewireAPI.__Rewire__('tileNames', { 1: 'NAME_1', 2: 'NAME_2' });
}

function teardown() {
  TileRewireAPI.__ResetDependency__('tileInfo');
  TileRewireAPI.__ResetDependency__('tileNames');
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

  // 40 tiles were stored
  t.is(keys(mockTileInfo).length, 40);
  // that all values in tileInfo have an id
  forEach(values(mockTileInfo), value => {
    t.true(has(value, 'id'));
  });
  // specific values are correct in tileInfo
  t.is(mockTileInfo.SPEEDPAD_RED_ACTIVE.radius, 15);
  t.is(mockTileInfo.ANGLE_WALL_2.traversable, false);
  t.is(mockTileInfo.RED_GATE.traversable, false);
  t.is(mockTileInfo.BLUE_GATE.traversable, true);
  // tileInfo dependent on team color
  t.true(mockAmRed.calledOnce);
  t.true(mockAmBlue.calledOnce);

  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  TileRewireAPI.__ResetDependency__('tileInfo');
  t.end();
});


test('getTileProperty: returns correct properties', t => {
  setup();

  t.is(getTileProperty(1, 'a'), '1');
  t.is(getTileProperty(1, 'b'), '2');
  t.is(getTileProperty('2', 'c'), '3');
  t.is(getTileProperty('2', 'd'), '4');

  teardown();
  t.end();
});


test('getTileProperty: throws error given tileIds that don\'t exist', t => {
  setup();

  t.throws(() => { getTileProperty(3, 'a'); });

  teardown();
  t.end();
});


test('getTileProperty: throws error given properties that don\'t exist', t => {
  setup();

  t.throws(() => { getTileProperty(1, 'c'); });
  t.throws(() => { getTileProperty('2', 'a'); });

  teardown();
  t.end();
});


test('getTileProperty: throws error when input id is wrong data type', t => {
  setup();

  t.throws(() => { getTileProperty('1', 'a'); });
  t.throws(() => { getTileProperty(2, 'c'); });

  teardown();
  t.end();
});


test('tileHasProperty: checks if a tile has a property', t => {
  setup();

  t.true(tileHasProperty(1, 'a'));
  t.true(tileHasProperty('2', 'd'));
  t.false(tileHasProperty(1, 'c'));
  t.false(tileHasProperty('2', 'b'));

  teardown();
  t.end();
});


test('tileHasProperty: throws error when input id is wrong data type', t => {
  setup();

  t.throws(() => { tileHasProperty('1', 'a'); });
  t.throws(() => { tileHasProperty(2, 'c'); });

  teardown();
  t.end();
});


test('tileHasName: returns true when tileId and name match', t => {
  setup();

  t.ok(tileHasName(1, 'NAME_1'));
  t.ok(tileHasName('2', 'NAME_2'));

  teardown();
  t.end();
});


test('tileHasName: returns false when tileId and name do not match', t => {
  setup();

  t.notOk(tileHasName(1, 'NAME_2'));
  t.notOk(tileHasName('2', 'NAME_1'));

  teardown();
  t.end();
});


test('tileIsOneOf: returns true when tile\'s name is in names', t => {
  setup();

  t.true(tileIsOneOf(1, ['NAME_1', 'NAME_2']));
  t.true(tileIsOneOf('2', ['NAME_1', 'NAME_2']));

  teardown();
  t.end();
});


test('tileIsOneOf: returns false when tile\'s name is in names', t => {
  setup();

  t.false(tileIsOneOf('2', ['NAME_1']));
  t.false(tileIsOneOf(1, ['NAME_2']));
  t.false(tileIsOneOf('1', ['NAME_1', 'NAME_2']));

  teardown();
  t.end();
});
