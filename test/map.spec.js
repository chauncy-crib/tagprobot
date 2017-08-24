import test from 'tape';
import sinon from 'sinon';
import {
  initMapTraversabilityCells,
  init2dArray,
  fillGridWithSubgrid,
  getTileTraversabilityInCells,
  getMapTraversabilityInCells,
  findTile,
  __RewireAPI__ as MapRewireAPI,
} from '../src/helpers/map';
import { setupTiles, teardownTiles } from './tiles.spec';
import { getTileId } from '../src/tiles';
import { PPTL } from '../src/constants';


test('init2dArray: returns 2d array that is correct size, and with correct value filled in', t => {
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


test('fillGridWithSubgrid: fills smaller grid into larger grid', t => {
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


test('fillGridWithSubgrid: throws when subgrid runs out of bounds on the big grid', t => {
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
  setupTiles(true);
  MapRewireAPI.__Rewire__('CPTL', 1);
  MapRewireAPI.__Rewire__('PPCL', 40);
  const expected = [
    [1],
  ];
  t.same(getTileTraversabilityInCells(getTileId('REGULAR_FLOOR')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('PPCL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with entirely nontraversable tile, CPTL=1', t => {
  setupTiles(true);
  MapRewireAPI.__Rewire__('CPTL', 1);
  MapRewireAPI.__Rewire__('PPCL', 40);
  const expected = [
    [0],
  ];
  t.same(getTileTraversabilityInCells(getTileId('SQUARE_WALL')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('PPCL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with entirely traversable tile, CPTL=4', t => {
  setupTiles(true);
  MapRewireAPI.__Rewire__('CPTL', 4);
  MapRewireAPI.__Rewire__('PPCL', 10);
  const expected = [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ];
  t.same(getTileTraversabilityInCells(getTileId('INACTIVE_PORTAL')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('PPCL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with CNTO, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  MapRewireAPI.__Rewire__('PPCL', 10);
  setupTiles(true);
  const expected = [
    [1, 0, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 0, 0, 1],
  ];
  t.same(getTileTraversabilityInCells(getTileId('SPIKE')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('PPCL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with CNTO, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  MapRewireAPI.__Rewire__('PPCL', 10);
  setupTiles(true);
  const expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(getTileId('ACTIVE_PORTAL')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('PPCL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 1, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  setupTiles(true);
  const expected = [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 1, 0],
  ];
  t.same(getTileTraversabilityInCells(getTileId('ANGLE_WALL_1')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 2, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  setupTiles(true);
  const expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 1, 1, 1],
  ];
  t.same(getTileTraversabilityInCells(getTileId('ANGLE_WALL_2')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 3, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  setupTiles(true);
  const expected = [
    [0, 1, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(getTileId('ANGLE_WALL_3')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with angled wall 4, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  setupTiles(true);
  const expected = [
    [1, 1, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(getTileTraversabilityInCells(getTileId('ANGLE_WALL_4')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: returns correctly with nontraversable tile, CPTL=8', t => {
  setupTiles(true);
  MapRewireAPI.__Rewire__('CPTL', 8);
  MapRewireAPI.__Rewire__('PPCL', 5);
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
  t.same(getTileTraversabilityInCells(getTileId('BUTTON')), expected);
  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('PPCL');

  MapRewireAPI.__Rewire__('CPTL', 8);
  MapRewireAPI.__Rewire__('PPCL', 5);
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
  t.same(getTileTraversabilityInCells(getTileId('SPIKE')), expected);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('PPCL');
  teardownTiles();

  t.end();
});


test('getTileTraversabilityInCells: throws errors for invalid inputs', t => {
  setupTiles(true);
  t.throws(() => { getTileTraversabilityInCells(false); });
  t.throws(() => { getTileTraversabilityInCells(1.23); });
  t.throws(() => { getTileTraversabilityInCells(undefined); });
  t.throws(() => { getTileTraversabilityInCells('apple'); });

  teardownTiles();

  t.end();
});


test('getMapTraversabilityInCells: returns correctly with CPTL=1', t => {
  // initialize current player as blue
  setupTiles(true);
  MapRewireAPI.__Rewire__('CPTL', 1);
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = getTileId('BOMB');
  const inactivebomb = getTileId('INACTIVE_BOMB');
  const spike = getTileId('SPIKE');
  const redgate = getTileId('RED_GATE');
  const bluegate = getTileId('BLUE_GATE');
  const blank = getTileId('REGULAR_FLOOR');

  const mockTilesToUpdateValues = [bomb, redgate, redgate, bluegate, bomb];
  MapRewireAPI.__Rewire__('mapTraversabilityCells', [
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
  ]);
  MapRewireAPI.__Rewire__('tilesToUpdate', [
    { x: 0, y: 0 },
    { x: 0, y: 2 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ]);
  MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);
  let mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);

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
  t.same(mockTilesToUpdateValues, [bomb, redgate, redgate, bluegate, bomb]);
  t.is(mockUpdateNTSprites.callCount, 5);

  mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
  mockMap[0][0] = inactivebomb;
  expected = [
    [1, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
  ];
  t.same(getMapTraversabilityInCells(mockMap), expected);
  t.same(mockTilesToUpdateValues, [inactivebomb, redgate, redgate, bluegate, bomb]);
  t.is(mockUpdateNTSprites.callCount, 5);

  mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
  // change the gate colors
  mockMap[0][2] = bluegate;
  mockMap[1][0] = bluegate;
  mockMap[1][1] = redgate;
  expected = [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ];
  t.same(getMapTraversabilityInCells(mockMap), expected);
  t.same(mockTilesToUpdateValues, [inactivebomb, bluegate, bluegate, redgate, bomb]);
  t.is(mockUpdateNTSprites.callCount, 5);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('mapTraversabilityCells');
  MapRewireAPI.__ResetDependency__('tilesToUpdate');
  MapRewireAPI.__ResetDependency__('tilesToUpdateValues');
  MapRewireAPI.__ResetDependency__('updateNTSprites');
  teardownTiles();

  t.end();
});


test('getMapTraversabilityInCells: returns correctly with CPTL=2', t => {
  setupTiles(false);
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = getTileId('BOMB');
  const inactivebomb = getTileId('INACTIVE_BOMB');
  const spike = getTileId('SPIKE');
  const redgate = getTileId('RED_GATE');
  const bluegate = getTileId('BLUE_GATE');
  const blank = getTileId('REGULAR_FLOOR');

  let mockTilesToUpdateValues = [inactivebomb, redgate, bluegate, redgate, bomb];
  MapRewireAPI.__Rewire__('mapTraversabilityCells', [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
  ]);
  MapRewireAPI.__Rewire__('tilesToUpdate', [
    { x: 0, y: 0 },
    { x: 0, y: 2 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ]);
  MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);

  MapRewireAPI.__Rewire__('CPTL', 2);
  let mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
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
  t.same(mockTilesToUpdateValues, [bomb, redgate, redgate, bluegate, bomb]);
  t.is(mockUpdateNTSprites.callCount, 5);

  mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
  mockTilesToUpdateValues = [inactivebomb, bluegate];
  MapRewireAPI.__Rewire__('mapTraversabilityCells', [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  MapRewireAPI.__Rewire__('tilesToUpdate', [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
  ]);
  MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);
  MapRewireAPI.__Rewire__('CPTL', 10);
  MapRewireAPI.__Rewire__('PPCL', 4);
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
  t.same(mockTilesToUpdateValues, [bomb, bluegate]);
  t.is(mockUpdateNTSprites.callCount, 2);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('PPCL');
  MapRewireAPI.__ResetDependency__('mapTraversabilityCells');
  MapRewireAPI.__ResetDependency__('tilesToUpdate');
  MapRewireAPI.__ResetDependency__('tilesToUpdateValues');
  MapRewireAPI.__ResetDependency__('updateNTSprites');
  teardownTiles();

  t.end();
});


test('initMapTraversabilityCells: stores correct values in mapTraversabilityCells, tilesToUpdate, and tilesToUpdateValues with CPT=2', t => {
  // initialize current player as blue
  setupTiles(true);
  MapRewireAPI.__Rewire__('CPTL', 1);
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = getTileId('BOMB');
  const spike = getTileId('SPIKE');
  const redgate = getTileId('RED_GATE');
  const bluegate = getTileId('BLUE_GATE');
  const blank = getTileId('REGULAR_FLOOR');

  const mockMapTraversabilityCells = [];
  const mockTilesToUpdate = [];
  const mockTilesToUpdateValues = [];

  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockMap = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */

  MapRewireAPI.__Rewire__('mapTraversabilityCells', mockMapTraversabilityCells);
  MapRewireAPI.__Rewire__('tilesToUpdate', mockTilesToUpdate);
  MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);
  const mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
  const mockGeneratePermanentNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('generatePermanentNTSprites', mockGeneratePermanentNTSprites);


  initMapTraversabilityCells(mockMap);

  t.same(mockMapTraversabilityCells, [
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
  ]);
  t.same(mockTilesToUpdate, [
    { x: 0, y: 0 },
    { x: 0, y: 2 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ]);
  t.same(mockTilesToUpdateValues, [bomb, redgate, redgate, bluegate, bomb]);
  t.ok(mockGeneratePermanentNTSprites.calledOnce); // one permanent NT object - the spike
  t.is(mockUpdateNTSprites.callCount, 4); // four non-permanent NT objects

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('mapTraversabilityCells');
  MapRewireAPI.__ResetDependency__('tilesToUpdate');
  MapRewireAPI.__ResetDependency__('tilesToUpdateValues');
  teardownTiles();

  t.end();
});


test('findTile: returns correctly with orthogonal inputs', t => {
  setupTiles(true);

  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = getTileId('BOMB');
  const spike = getTileId('SPIKE');
  const redgate = getTileId('RED_GATE');
  const bluegate = getTileId('BLUE_GATE');
  const blank = getTileId('REGULAR_FLOOR');

  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockMap = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */

  t.same(findTile(mockMap, bomb), { x: 0 * PPTL, y: 0 * PPTL });
  t.same(findTile(mockMap, redgate), { x: 0 * PPTL, y: 2 * PPTL });
  t.same(findTile(mockMap, spike), { x: 2 * PPTL, y: 1 * PPTL });

  teardownTiles();

  t.end();
});
