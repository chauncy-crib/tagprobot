import test from 'tape';
import sinon from 'sinon';
import {
  initMapTraversabilityCells,
  init2dArray,
  fillGridWithSubgrid,
  getTileTraversabilityInCells,
  getMapTraversabilityInCells,
  __RewireAPI__ as MapRewireAPI,
} from '../src/helpers/map';
import { setupTiles, teardownTiles } from './tiles.spec';
import { teams } from '../src/constants';
import { getTileId } from '../src/tiles';


test('init2dArray: returns 2d array that is correct size, and with correct value filled in', t => {
  let width = 5;
  let height = 3;
  let defaultVal = 1;
  t.same(init2dArray(width, height, defaultVal), [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ]);

  width = 3;
  height = 3;
  defaultVal = 55;
  t.same(init2dArray(width, height, defaultVal), [
    [55, 55, 55],
    [55, 55, 55],
    [55, 55, 55],
  ]);

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
  fillGridWithSubgrid(grid, subgrid, 0, 0);
  t.same(grid, [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ]);

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
  fillGridWithSubgrid(grid, subgrid, 1, 0);
  t.same(grid, [
    [0, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 0],
  ]);

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


test('getTileTraversabilityInCells() ', tester => {
  tester.test('returns correctly with entirely traversable tile, CPTL=1', t => {
    setupTiles(teams.BLUE);
    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('PPCL', 40);
    t.same(getTileTraversabilityInCells(getTileId('REGULAR_FLOOR')), [
      [1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with entirely nontraversable tile, CPTL=1', t => {
    setupTiles(teams.BLUE);
    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('PPCL', 40);
    t.same(getTileTraversabilityInCells(getTileId('SQUARE_WALL')), [
      [0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with entirely traversable tile, CPTL=4', t => {
    setupTiles(teams.BLUE);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('PPCL', 10);
    t.same(getTileTraversabilityInCells(getTileId('INACTIVE_PORTAL')), [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with CNTO, CPTL=4', t => {
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('PPCL', 10);
    setupTiles(teams.BLUE);
    t.same(getTileTraversabilityInCells(getTileId('SPIKE')), [
      [1, 0, 0, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 0, 0, 1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with CNTO, CPTL=4', t => {
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('PPCL', 10);
    setupTiles(teams.BLUE);
    t.same(getTileTraversabilityInCells(getTileId('ACTIVE_PORTAL')), [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with angled wall 1, CPTL=4', t => {
    MapRewireAPI.__Rewire__('CPTL', 4);
    setupTiles(teams.BLUE);
    t.same(getTileTraversabilityInCells(getTileId('ANGLE_WALL_1')), [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with angled wall 2, CPTL=4', t => {
    MapRewireAPI.__Rewire__('CPTL', 4);
    setupTiles(teams.BLUE);
    t.same(getTileTraversabilityInCells(getTileId('ANGLE_WALL_2')), [
      [0, 0, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 1, 1],
      [0, 1, 1, 1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with angled wall 3, CPTL=4', t => {
    MapRewireAPI.__Rewire__('CPTL', 4);
    setupTiles(teams.BLUE);
    t.same(getTileTraversabilityInCells(getTileId('ANGLE_WALL_3')), [
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1],
      [0, 0, 0, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with angled wall 4, CPTL=4', t => {
    MapRewireAPI.__Rewire__('CPTL', 4);
    setupTiles(teams.BLUE);
    t.same(getTileTraversabilityInCells(getTileId('ANGLE_WALL_4')), [
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    teardownTiles();

    t.end();
  });


  tester.test('returns correctly with nontraversable tile, CPTL=8', t => {
    setupTiles(teams.BLUE);
    MapRewireAPI.__Rewire__('CPTL', 8);
    MapRewireAPI.__Rewire__('PPCL', 5);
    t.same(getTileTraversabilityInCells(getTileId('BUTTON')), [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ]);
    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');

    MapRewireAPI.__Rewire__('CPTL', 8);
    MapRewireAPI.__Rewire__('PPCL', 5);
    t.same(getTileTraversabilityInCells(getTileId('SPIKE')), [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');
    teardownTiles();

    t.end();
  });


  tester.test('throws errors for invalid inputs', t => {
    setupTiles(teams.BLUE);
    t.throws(() => { getTileTraversabilityInCells(false); });
    t.throws(() => { getTileTraversabilityInCells(1.23); });
    t.throws(() => { getTileTraversabilityInCells(undefined); });
    t.throws(() => { getTileTraversabilityInCells('apple'); });

    teardownTiles();

    t.end();
  });
  tester.end();
});


test('getMapTraversabilityInCells: returns correctly with CPTL=1', t => {
  // initialize current player as blue
  setupTiles(teams.BLUE);
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
  t.same(getMapTraversabilityInCells(mockMap), [
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
  ]);
  t.same(mockTilesToUpdateValues, [bomb, redgate, redgate, bluegate, bomb]);
  t.is(mockUpdateNTSprites.callCount, 5);

  mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
  mockMap[0][0] = inactivebomb;
  t.same(getMapTraversabilityInCells(mockMap), [
    [1, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
  ]);
  t.same(mockTilesToUpdateValues, [inactivebomb, redgate, redgate, bluegate, bomb]);
  t.is(mockUpdateNTSprites.callCount, 5);

  mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
  // change the gate colors
  mockMap[0][2] = bluegate;
  mockMap[1][0] = bluegate;
  mockMap[1][1] = redgate;
  t.same(getMapTraversabilityInCells(mockMap), [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ]);
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
  setupTiles(teams.RED);
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
  t.same(getMapTraversabilityInCells(mockMap), [
    [0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
  ]);
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

  t.same(getMapTraversabilityInCells(smallMap), [
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
  ]);
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


test('initMapTraversabilityCells()', tester => {
  tester.test('correctly updates mapTraversabilityCells, tilesToUpdate, tilesToUpdateValues', t => {
    // initialize current player as blue
    setupTiles(teams.BLUE);
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
  tester.end();
});
