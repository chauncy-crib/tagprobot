import test from 'tape';
import _ from 'lodash';
import has from 'lodash/has';
import sinon from 'sinon';

import {
  computeTileInfo,
  getTileProperty,
  tileHasName,
  tileHasProperty,
  tileIsOneOf,
  __RewireAPI__ as TileRewireAPI,
} from '../src/tiles';

// functions for setupTiles and teardownTiles tests begin here

function setupTiles() {
  TileRewireAPI.__Rewire__('tileInfo', {
    NAME_1: { id: 1, a: '1', b: '2' },
    NAME_2: { id: '2', c: '3', d: '4' },
  });
  TileRewireAPI.__Rewire__('tileNames', { 1: 'NAME_1', 2: 'NAME_2' });
}

function teardownTiles() {
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

  // 51 tiles were stored
  t.is(_.keys(mockTileInfo).length, 51);
  // that all values in tileInfo have an id
  _.forEach(_.values(mockTileInfo), value => {
    t.true(has(value, 'id'));
  });
  // specific values are correct in tileInfo
  t.is(mockTileInfo.SPEEDPAD_RED_ACTIVE.radius, 15);
  t.is(mockTileInfo.ANGLE_WALL_2.traversable, false);
  t.is(mockTileInfo.RED_GATE.traversable, false);
  t.is(mockTileInfo.BLUE_GATE.traversable, true);
  // tileInfo dependent on team color
  t.is(mockAmRed.callCount, 1);
  t.is(mockAmBlue.callCount, 1);

  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  TileRewireAPI.__ResetDependency__('tileInfo');
  t.end();
});


test('getTileProperty: returns correct properties', t => {
  setupTiles();

  t.is(getTileProperty(1, 'a'), '1');
  t.is(getTileProperty(1, 'b'), '2');
  t.is(getTileProperty('2', 'c'), '3');
  t.is(getTileProperty('2', 'd'), '4');

  teardownTiles();
  t.end();
});


test('getTileProperty: throws error given tileIds that don\'t exist', t => {
  setupTiles();

  t.throws(() => { getTileProperty(3, 'a'); });

  teardownTiles();
  t.end();
});


test('getTileProperty: throws error given properties that don\'t exist', t => {
  setupTiles();

  t.throws(() => { getTileProperty(1, 'c'); });
  t.throws(() => { getTileProperty('2', 'a'); });

  teardownTiles();
  t.end();
});


test('getTileProperty: throws error when input id is wrong data type', t => {
  setupTiles();

  t.throws(() => { getTileProperty('1', 'a'); });
  t.throws(() => { getTileProperty(2, 'c'); });

  teardownTiles();
  t.end();
});


test('tileHasProperty: checks if a tile has a property', t => {
  setupTiles();

  t.true(tileHasProperty(1, 'a'));
  t.true(tileHasProperty('2', 'd'));
  t.false(tileHasProperty(1, 'c'));
  t.false(tileHasProperty('2', 'b'));

  teardownTiles();
  t.end();
});


test('tileHasProperty: throws error when input id is wrong data type', t => {
  setupTiles();

  t.throws(() => { tileHasProperty('1', 'a'); });
  t.throws(() => { tileHasProperty(2, 'c'); });

  teardownTiles();
  t.end();
});


test('tileHasName: returns true when tileId and name match', t => {
  setupTiles();

  t.true(tileHasName(1, 'NAME_1'));
  t.true(tileHasName('2', 'NAME_2'));

  teardownTiles();
  t.end();
});


test('tileHasName: returns false when tileId and name do not match', t => {
  setupTiles();

  t.false(tileHasName(1, 'NAME_2'));
  t.false(tileHasName('2', 'NAME_1'));

  teardownTiles();
  t.end();
});


test('tileIsOneOf: returns true when tile\'s name is in names', t => {
  setupTiles();

  t.true(tileIsOneOf(1, ['NAME_1', 'NAME_2']));
  t.true(tileIsOneOf('2', ['NAME_1', 'NAME_2']));

  teardownTiles();
  t.end();
});


test('tileIsOneOf: returns false when tile\'s name is in names', t => {
  setupTiles();

  t.false(tileIsOneOf('2', ['NAME_1']));
  t.false(tileIsOneOf(1, ['NAME_2']));
  t.false(tileIsOneOf('1', ['NAME_1', 'NAME_2']));

  teardownTiles();
  t.end();
});
