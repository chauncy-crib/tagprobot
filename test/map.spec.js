import test from 'tape';
import {
  init2dArray,
  isTraversable,
  getCNTORadius,
  fillGridWithSubgrid,
  getMapTraversabilityInCells,
  getTileTraversabilityInCells,
  __RewireAPI__ as MapRewireAPI,
} from '../src/helpers/map';


import { tileTypes } from '../src/constants';


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


test('isTraversable: correctly returns true for varying inputs', t => {
  t.true(isTraversable(2)); // Regular floor
  t.true(isTraversable(3.1)); // taken red flag
  t.true(isTraversable(9)); // inactive gate
  t.true(isTraversable(17)); // red endzone

  t.end();
});


test('isTraversable: correctly returns false for varying inputs', t => {
  t.false(isTraversable(0)); // Blank space
  t.false(isTraversable(1)); // square wall
  t.false(isTraversable(7)); // spike

  t.end();
});


test('isTraversable: throws errors for invalid inputs', t => {
  t.throws(() => { isTraversable(1.123); });
  t.throws(() => { isTraversable(-1); });
  t.throws(() => { isTraversable('potato'); });
  t.throws(() => { isTraversable(undefined); });

  t.end();
});


test('getCNTORadius: correctly returns for varying inputs', t => {
  t.is(getCNTORadius(tileTypes.SPIKE), 14);
  t.is(getCNTORadius(tileTypes.BUTTON), 8);

  t.end();
});


test('getCNTORadius: throws errors for invalid inputs', t => {
  t.throws(() => { getCNTORadius(tileTypes.STANDARD_FLOOR); });
  t.throws(() => { getCNTORadius('banana'); });
  t.throws(() => { getCNTORadius(undefined); });

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
  MapRewireAPI.__Rewire__('CPTL', 1);
  const expected = [
    [1],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.REGULAR_FLOOR), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with entirely nontraversable tile, CPTL=1', t => {
  MapRewireAPI.__Rewire__('CPTL', 1);
  const expected = [
    [0],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.SQUARE_WALL), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with entirely traversable tile, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.INACTIVE_PORTAL), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with CNTO, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [1, 0, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 0, 0, 1],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.SPIKE), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with CNTO, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.ACTIVE_PORTAL), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 1, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 1, 0],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.ANGLE_WALL_1), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 2, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 1, 1, 1],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.ANGLE_WALL_2), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 3, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [0, 1, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.ANGLE_WALL_3), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 4, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [1, 1, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(tileTypes.ANGLE_WALL_4), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with nontraversable tile, CPTL=8', t => {
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
  t.same(getTileTraversabilityInCells(tileTypes.BUTTON), expected);
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
  t.same(getTileTraversabilityInCells(tileTypes.SPIKE), expected);
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getTileTraversabilityInCells: throws errors for invalid inputs', t => {
  t.throws(() => { getTileTraversabilityInCells(false); });
  t.throws(() => { getTileTraversabilityInCells(1.23); });
  t.throws(() => { getTileTraversabilityInCells(undefined); });
  t.throws(() => { getTileTraversabilityInCells('apple'); });

  t.end();
});


test('getMapTraversabilityInCells: returns correctly with CPTL=1', t => {
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = tileTypes.BOMB;
  const spike = tileTypes.SPIKE;
  const redgate = tileTypes.RED_GATE;
  const bluegate = tileTypes.BLUE_GATE;
  const blank = tileTypes.REGULAR_FLOOR;

  // initialize current player as blue
  MapRewireAPI.__Rewire__('amBlue', () => true);
  MapRewireAPI.__Rewire__('amRed', () => false);
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
  MapRewireAPI.__ResetDependency__('amBlue');
  MapRewireAPI.__ResetDependency__('amRed');
  MapRewireAPI.__ResetDependency__('CPTL');

  // initialize current player as red
  MapRewireAPI.__Rewire__('amBlue', () => false);
  MapRewireAPI.__Rewire__('amRed', () => true);
  MapRewireAPI.__Rewire__('CPTL', 1);
  expected = [
    [0, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ];
  t.same(getMapTraversabilityInCells(mockMap), expected);
  MapRewireAPI.__ResetDependency__('amBlue');
  MapRewireAPI.__ResetDependency__('amRed');
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});


test('getMapTraversabilityInCells: returns correctly with CPTL=2', t => {
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = tileTypes.BOMB;
  const spike = tileTypes.SPIKE;
  const redgate = tileTypes.RED_GATE;
  const bluegate = tileTypes.BLUE_GATE;
  const blank = tileTypes.REGULAR_FLOOR;

  MapRewireAPI.__Rewire__('amBlue', () => false);
  MapRewireAPI.__Rewire__('amRed', () => true);
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
  MapRewireAPI.__ResetDependency__('amBlue');
  MapRewireAPI.__ResetDependency__('amRed');
  MapRewireAPI.__ResetDependency__('CPTL');

  MapRewireAPI.__Rewire__('amBlue', () => false);
  MapRewireAPI.__Rewire__('amRed', () => true);
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
  MapRewireAPI.__ResetDependency__('amBlue');
  MapRewireAPI.__ResetDependency__('amRed');
  MapRewireAPI.__ResetDependency__('CPTL');

  t.end();
});
