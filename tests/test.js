/* eslint-disable no-unused-vars  */
import test from 'tape';
import * as helpers from '../src/helpers';

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
  helpers.fillGridWithSubgrid(grid, subgrid, 0, 0);
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
  helpers.fillGridWithSubgrid(grid, subgrid, 1, 0);
  t.same(grid, expected);
});

test('test traversableCellsInTile', t => {
  t.plan(5);
  let expected = [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ];
  t.same(helpers.traversableCellsInTile(true, 4, 14), expected);

  expected = [
    [1, 0, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 0, 0, 1],
  ];
  t.same(helpers.traversableCellsInTile(false, 4, 14), expected);

  expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(helpers.traversableCellsInTile(false, 4, 15), expected);

  expected = [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ];
  t.same(helpers.traversableCellsInTile(false, 6, 1), expected);

  expected = [
    [1, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 1, 1],
  ];
  t.same(helpers.traversableCellsInTile(false, 6, 14), expected);
});


test('test getTraversableCells', t => {
  // plan to do one assert
  t.plan(2);

  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = helpers.tileTypes.BOMB;
  const spike = helpers.tileTypes.SPIKE;
  const redgate = helpers.tileTypes.RED_GATE;
  const bluegate = helpers.tileTypes.BLUE_GATE;
  const blank = helpers.tileTypes.REGULAR_FLOOR;

  // initialize current player as red
  const me = { team: helpers.RED_TEAM };

  // define the number of cells per tile
  let cpt = 1;

  /* eslint-disable no-multi-spaces */
  /* eslint-disable array-bracket-spacing */
  const map = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces */
  /* eslint-enable array-bracket-spacing */

  // this is what we expect the function to return
  let expected = [
    [0, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ];

  // do the assertion
  t.same(helpers.getTraversableCells(cpt, map, me), expected);


  // define the number of cells per tile
  cpt = 2;

  // this is what we expect the function to return
  expected = [
    [0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
  ];

  // do the assertion
  t.same(helpers.getTraversableCells(cpt, map, me), expected);
});
