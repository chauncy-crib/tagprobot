import test from 'tape';
import * as map from '../src/helpers/map';
import { tileTypes, teams } from '../src/constants';
import { mockMe } from '../src/helpers/player';


test('test fillGridWithSubgrid', t => {
  t.plan(2);
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
});

test('test addBufferTo2dArray', t => {
  t.plan(1);

  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  const bufferSize = 2;
  const expected = [
    [1, 1, 1, 2, 3, 3, 3],
    [1, 1, 1, 2, 3, 3, 3],
    [1, 1, 1, 2, 3, 3, 3],
    [4, 4, 4, 5, 6, 6, 6],
    [7, 7, 7, 8, 9, 9, 9],
    [7, 7, 7, 8, 9, 9, 9],
    [7, 7, 7, 8, 9, 9, 9],
  ];
  t.same(helpers.addBufferTo2dArray(matrix, bufferSize), expected);
});

test('test traversableCellsInTile', t => {
  t.plan(5);
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
});


test('test getTraversableCells', t => {
  t.plan(4);

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

  /* eslint-disable no-multi-spaces */
  /* eslint-disable array-bracket-spacing */
  const mockMap = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces */
  /* eslint-enable array-bracket-spacing */

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
});


test('test init2dArray', t => {
  t.plan(2);

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
  t.same(helpers.init2dArray(width, height, defaultVal), expected);

  width = 3;
  height = 3;
  defaultVal = 55;
  expected = [
    [55, 55, 55],
    [55, 55, 55],
    [55, 55, 55],
  ];
  t.same(helpers.init2dArray(width, height, defaultVal), expected);
});


test('test multiplyCorrespondingElementsAndSum', t => {
  t.plan(1);

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

  t.same(helpers.multiplyCorrespondingElementsAndSum(m1, m2), expected);
});
