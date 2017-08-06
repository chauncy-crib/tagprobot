import test from 'tape';
import {
  init2dArray,
  fillGridWithSubgrid,
  getMapTraversabilityInCells,
  getTileTraversabilityInCells,
  __RewireAPI__ as MapRewireAPI,
} from '../src/helpers/map';

import { getId, computeTileInfo, resetTileInfo, __RewireAPI__ as TileRewireAPI } from '../src/tiles';

test('init2dArray: returns correctly with varying inputs', t => {
  let width = 5;
  let height = 3;
  let defaultVal = 1;
  let expected = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  t.same(init2dArray(width, height, defaultVal), expected);

  width = 3;
  height = 3;
  defaultVal = 55;
  expected = [
    [55, 55, 55],
    [55, 55, 55],
    [55, 55, 55],
  ];
  t.same(init2dArray(width, height, defaultVal), expected);

  t.end();
});


test('fillGridWithSubgrid: correctly fills larger grids', t => {
  let grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  let subgrid = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  let expected = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  fillGridWithSubgrid(grid, subgrid, 0, 0);
  t.same(grid, expected);

  grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  subgrid = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  expected = [
    [0, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 0],
  ];
  fillGridWithSubgrid(grid, subgrid, 1, 0);
  t.same(grid, expected);

  t.end();
});


test('fillGridWithSubgrid: throws errors for invalid inputs', t => {
  const grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  const subgrid = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  t.throws(() => { fillGridWithSubgrid(grid, subgrid, -1, 1); });
  t.throws(() => { fillGridWithSubgrid(grid, subgrid, 1, 2); });
  t.throws(() => { fillGridWithSubgrid(subgrid, grid, 0, 0); });

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with entirely traversable tile, CPTL=1', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  MapRewireAPI.__Rewire__('CPTL', 1);
  const expected = [
    [1],
  ];
  t.same(getTileTraversabilityInCells(getId('REGULAR_FLOOR')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with entirely nontraversable tile, CPTL=1', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  MapRewireAPI.__Rewire__('CPTL', 1);
  const expected = [
    [0],
  ];
  t.same(getTileTraversabilityInCells(getId('SQUARE_WALL')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with entirely traversable tile, CPTL=4', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ];
  t.same(getTileTraversabilityInCells(getId('INACTIVE_PORTAL')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with CNTO, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  const expected = [
    [1, 0, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 0, 0, 1],
  ];
  t.same(getTileTraversabilityInCells(getId('SPIKE')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with CNTO, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  const expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(getId('ACTIVE_PORTAL')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 1, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  const expected = [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 1, 0],
  ];
  t.same(getTileTraversabilityInCells(getId('ANGLE_WALL_1')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 2, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  const expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 1, 1, 1],
  ];
  t.same(getTileTraversabilityInCells(getId('ANGLE_WALL_2')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 3, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  const expected = [
    [0, 1, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(getId('ANGLE_WALL_3')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 4, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  const expected = [
    [1, 1, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(getId('ANGLE_WALL_4')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: returns correctly with nontraversable tile, CPTL=8', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  MapRewireAPI.__Rewire__('CPTL', 8);
  let expected = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  t.same(getTileTraversabilityInCells(getId('BUTTON')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  MapRewireAPI.__Rewire__('CPTL', 8);
  expected = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  t.same(getTileTraversabilityInCells(getId('SPIKE')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getTileTraversabilityInCells: throws errors for invalid inputs', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  t.throws(() => { getTileTraversabilityInCells(false); });
  t.throws(() => { getTileTraversabilityInCells(1.23); });
  t.throws(() => { getTileTraversabilityInCells(undefined); });
  t.throws(() => { getTileTraversabilityInCells('apple'); });

  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getMapTraversabilityInCells: returns correctly with CPTL=1', t => {
  TileRewireAPI.__Rewire__('amBlue', () => true);
  TileRewireAPI.__Rewire__('amRed', () => false);
  computeTileInfo();
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = getId('BOMB');
  const spike = getId('SPIKE');
  const redgate = getId('RED_GATE');
  const bluegate = getId('BLUE_GATE');
  const blank = getId('REGULAR_FLOOR');

  // initialize current player as blue

  MapRewireAPI.__Rewire__('CPTL', 1);
  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockMap = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  // this is what we expect the function to return
  let expected = [
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
  ];
  t.same(getMapTraversabilityInCells(mockMap), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  // initialize current player as red
  MapRewireAPI.__Rewire__('CPTL', 1);
  TileRewireAPI.__Rewire__('amBlue', () => false);
  TileRewireAPI.__Rewire__('amRed', () => true);
  computeTileInfo();
  expected = [
    [0, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ];
  t.same(getMapTraversabilityInCells(mockMap), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});


test('getMapTraversabilityInCells: returns correctly with CPTL=2', t => {
  TileRewireAPI.__Rewire__('amBlue', () => false);
  TileRewireAPI.__Rewire__('amRed', () => true);
  computeTileInfo();
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = getId('BOMB');
  const spike = getId('SPIKE');
  const redgate = getId('RED_GATE');
  const bluegate = getId('BLUE_GATE');
  const blank = getId('REGULAR_FLOOR');

  MapRewireAPI.__Rewire__('CPTL', 2);
  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockMap = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  let expected = [
    [0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
  ];
  t.same(getMapTraversabilityInCells(mockMap), expected);

  MapRewireAPI.__Rewire__('CPTL', 10);
  const smallMap = [[bomb, bluegate]];
  expected = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  t.same(getMapTraversabilityInCells(smallMap), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  TileRewireAPI.__ResetDependency__('amBlue');
  TileRewireAPI.__ResetDependency__('amRed');
  resetTileInfo();
  t.end();
});
