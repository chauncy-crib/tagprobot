import test from 'tape';
import * as map from '../src/helpers/map';
import { tileTypes, teams } from '../src/constants';
import { mockMe } from '../src/helpers/player';

test('test isTraversable', t => {
  t.true(map.isTraversable(2)); // Regular floor
  t.true(map.isTraversable(3.1)); // taken red flag
  t.true(map.isTraversable(9)); // inactive gate
  t.true(map.isTraversable(17)); // red endzone
  t.false(map.isTraversable(0)); // Blank space
  t.false(map.isTraversable(1)); // square wall
  t.false(map.isTraversable(7)); // spike
  // some inputs that the function shouldn't handle
  t.throws(() => { map.isTraversable(1.123); });
  t.throws(() => { map.isTraversable(-1); });
  t.throws(() => { map.isTraversable('potato'); });
  t.throws(() => { map.isTraversable(undefined); });
  t.end();
});

test('test fillGridWithSubgrid', t => {
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
  map.fillGridWithSubgrid(grid, subgrid, 0, 0);
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
  map.fillGridWithSubgrid(grid, subgrid, 1, 0);
  t.same(grid, expected);

  t.end();
});

test('test addBufferTo2dArray', t => {
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  const bufSize = 2;
  const bufVal = 1;
  const expected = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 3, 1, 1],
    [1, 1, 4, 5, 6, 1, 1],
    [1, 1, 7, 8, 9, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  t.same(map.addBufferTo2dArray(matrix, bufSize, bufVal), expected);

  t.end();
});

test('test getSubarrayFrom2dArray', t => {
  let array = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 0, 1, 2],
    [3, 4, 5, 6],
  ];
  let xCenter = 2;
  let yCenter = 2;
  let width = 3;
  let height = 3;
  let expected = [
    [6, 7, 8],
    [0, 1, 2],
    [4, 5, 6],
  ];
  t.same(map.getSubarrayFrom2dArray(array, xCenter, yCenter, width, height), expected);

  array = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 0, 1, 2],
    [3, 4, 5, 6, 7, 8],
    [9, 0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 0],
  ];
  xCenter = 2;
  yCenter = 1;
  width = 5;
  height = 3;
  expected = [
    [1, 2, 3],
    [7, 8, 9],
    [3, 4, 5],
    [9, 0, 1],
    [5, 6, 7],
  ];
  t.same(map.getSubarrayFrom2dArray(array, xCenter, yCenter, width, height), expected);

  t.end();
});

test('test traversableCellsInTile', t => {
  let expected = [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ];
  t.same(map.traversableCellsInTile(true, 4, 14), expected);

  expected = [
    [1, 0, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 0, 0, 1],
  ];
  t.same(map.traversableCellsInTile(false, 4, 14), expected);

  expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(map.traversableCellsInTile(false, 4, 15), expected);

  expected = [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ];
  t.same(map.traversableCellsInTile(false, 6, 1), expected);

  expected = [
    [1, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 1, 1],
  ];
  t.same(map.traversableCellsInTile(false, 6, 14), expected);

  t.end();
});


test('test getTraversableCells', t => {
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = tileTypes.BOMB;
  const spike = tileTypes.SPIKE;
  const redgate = tileTypes.RED_GATE;
  const bluegate = tileTypes.BLUE_GATE;
  const blank = tileTypes.REGULAR_FLOOR;

  // initialize current player as blue
  mockMe(teams.BLUE);

  // define the number of cells per tile
  let cpt = 1;

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
  t.same(map.getTraversableCells(cpt, mockMap), expected);


  // initialize current player as red
  mockMe(teams.RED);
  expected = [
    [0, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ];
  t.same(map.getTraversableCells(cpt, mockMap), expected);

  cpt = 2;
  expected = [
    [0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
  ];
  t.same(map.getTraversableCells(cpt, mockMap), expected);

  cpt = 10;
  const smallMap = [[bomb, bluegate]];
  // For an object with radius 29, there are no traversable cells.
  // TODO: fix this unit test when we have proper object radii
  // implemented in getTraversableCells
  expected = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  t.same(map.getTraversableCells(cpt, smallMap), expected);

  t.end();
});


test('test init2dArray', t => {
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
  t.same(map.init2dArray(width, height, defaultVal), expected);

  width = 3;
  height = 3;
  defaultVal = 55;
  expected = [
    [55, 55, 55],
    [55, 55, 55],
    [55, 55, 55],
  ];
  t.same(map.init2dArray(width, height, defaultVal), expected);

  t.end();
});


test('test multiplyCorrespondingElementsAndSum', t => {
  const m1 = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  const m2 = [
    [9, 8, 7],
    [6, 5, 4],
    [3, 2, 1],
  ];

  const expected = 165;

  t.is(map.multiplyCorrespondingElementsAndSum(m1, m2), expected);

  t.end();
});

test('test convolve', t => {
  let m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  let k = [
    [1],
  ];
  let expected = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  t.same(map.convolve(m, k), expected);

  m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  k = [
    [2],
  ];
  /* eslint-disable no-multi-spaces, array-bracket-spacing*/
  expected = [
    [ 2,  4,  6],
    [ 8, 10, 12],
    [14, 16, 18],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  t.same(map.convolve(m, k), expected);

  m = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 0, 1, 2],
  ];
  k = [
    [1, 2, 3],
    [3, 4, 5],
    [6, 7, 8],
  ];
  /* eslint-disable no-multi-spaces, array-bracket-spacing*/
  expected = [
    [112, 160, 193, 142],
    [131, 150, 129, 100],
    [ 89,  91,  79,  63],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  t.same(map.convolve(m, k), expected);

  t.end();
});
