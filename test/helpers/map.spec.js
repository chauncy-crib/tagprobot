import test from 'tape';
import sinon from 'sinon';
import { init2dArray, fillGridWithSubgrid } from '../../src/utils/mapUtils';
import {
  initMapTraversabilityCells,
  updateNumNTO,
  updateTraversabilityFromNumNTO,
  getTileTraversabilityInCells,
  getMapTraversabilityInCells,
  __RewireAPI__ as MapRewireAPI,
} from '../../src/helpers/map';


/* eslint-disable no-multi-spaces, array-bracket-spacing */
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


test('updateTraversabilityFromNumNTO', tester => {
  tester.test('returns correctly with fully updated 3x3 grid', t => {
    const numNTO = [
      [1, 2, 3],
      [0, 1, 1],
      [2, 0, 9],
    ];
    const traversability = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ];
    const xMin = 0;
    const yMin = 0;
    const xMax = 3;
    const yMax = 3;

    updateTraversabilityFromNumNTO(numNTO, traversability, xMin, yMin, xMax, yMax);
    t.same(traversability, [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
    ]);

    t.end();
  });


  tester.test('only updates elements within the specified area', t => {
    const numNTO = [
      [0, 0, 0],
      [1, 2, 3],
      [0, 0, 0],
    ];
    const traversability = [
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
    ];
    const xMin = 1;
    const yMin = 1;
    const xMax = 3;
    const yMax = 3;

    updateTraversabilityFromNumNTO(numNTO, traversability, xMin, yMin, xMax, yMax);
    t.same(traversability, [
      [1, 0, 1],
      [1, 0, 0],
      [1, 1, 1],
    ]);

    t.end();
  });

  tester.end();
});


test('getTileTraversabilityInCells() ', tester => {
  tester.test('returns correctly with entirely traversable tile, CPTL=1', t => {
    // is entirely traversable
    const mockGetTileProperty = sinon.stub().withArgs('mockTileId', 'traversable').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    t.end();
  });


  tester.test('returns correctly with entirely nontraversable tile, CPTL=1', t => {
    // not entirely traversable
    const mockGetTileProperty = sinon.stub().withArgs('mockTileId', 'traversable').returns(false);
    // has no radius
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(false);
    // is not angle wall
    const mockTileIsOneOf = sinon.stub().returns(false);
    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    t.end();
  });


  tester.test('returns correctly with entirely nontraversable tile, CPTL=4', t => {
    // not entirely traversable
    const mockGetTileProperty = sinon.stub().withArgs('mockTileId', 'traversable').returns(false);
    // has no radius
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(false);
    // is not angle wall
    const mockTileIsOneOf = sinon.stub().returns(false);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    t.end();
  });


  tester.test('returns correctly with CNTO, radius=14, CPTL=4', t => {
    const mockGetTileProperty = sinon.stub();
    // not entirely traversable
    mockGetTileProperty.withArgs('mockTileId', 'traversable').returns(false);
    // radius of 14
    mockGetTileProperty.withArgs('mockTileId', 'radius').returns(14);
    // has radius
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(true);
    // is not angle wall
    const mockTileIsOneOf = sinon.stub().returns(false);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('PPCL', 10);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [1, 0, 0, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 0, 0, 1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    t.end();
  });


  tester.test('returns correctly with CNTO, radius=15, CPTL=4', t => {
    const mockGetTileProperty = sinon.stub();
    // not entirely traversable
    mockGetTileProperty.withArgs('mockTileId', 'traversable').returns(false);
    // radius of 15
    mockGetTileProperty.withArgs('mockTileId', 'radius').returns(15);
    // has radius
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(true);
    // is not angle wall
    const mockTileIsOneOf = sinon.stub().returns(false);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('PPCL', 10);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('PPCL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    t.end();
  });


  tester.test('returns correctly with CNTO, radius=8, CPTL=8', t => {
    const mockGetTileProperty = sinon.stub();
    // not entirely traversable
    mockGetTileProperty.withArgs('mockTileId', 'traversable').returns(false);
    mockGetTileProperty.withArgs('mockTileId', 'radius').returns(8);
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(true);
    const mockTileIsOneOf = sinon.stub().returns(false);
    MapRewireAPI.__Rewire__('CPTL', 8);
    MapRewireAPI.__Rewire__('PPCL', 5);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('mockTileId'), [// button
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ]);
    mockGetTileProperty.withArgs('mockTileId', 'radius').returns(14);
    t.same(getTileTraversabilityInCells('mockTileId'), [// spike
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
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    t.end();
  });


  tester.test('returns correctly with angled wall 1, CPTL=4', t => {
    // not entirely traversable
    const mockGetTileProperty = sinon.stub().withArgs('mockTileId', 'traversable').returns(false);
    // does not have radius
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(false);
    // is angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'mockTileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(true);
    // is angle wall 1
    const mockTileHasName = sinon.stub().returns(false);
    mockTileHasName.withArgs('mockTileId', 'ANGLE_WALL_1').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    MapRewireAPI.__Rewire__('tileHasName', mockTileHasName);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    MapRewireAPI.__ResetDependency__('tileHasName');
    t.end();
  });


  tester.test('returns correctly with angled wall 2, CPTL=4', t => {
    // not entirely traversable
    const mockGetTileProperty = sinon.stub().withArgs('mockTileId', 'traversable').returns(false);
    // does not have radius
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(false);
    // is angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'mockTileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(true);
    // is angle wall 2
    const mockTileHasName = sinon.stub().returns(false);
    mockTileHasName.withArgs('mockTileId', 'ANGLE_WALL_2').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    MapRewireAPI.__Rewire__('tileHasName', mockTileHasName);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [0, 0, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 1, 1],
      [0, 1, 1, 1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    MapRewireAPI.__ResetDependency__('tileHasName');
    t.end();
  });


  tester.test('returns correctly with angled wall 3, CPTL=4', t => {
    // not entirely traversable
    const mockGetTileProperty = sinon.stub().withArgs('mockTileId', 'traversable').returns(false);
    // does not have radius
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(false);
    // is angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'mockTileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(true);
    // is angle wall 3
    const mockTileHasName = sinon.stub().returns(false);
    mockTileHasName.withArgs('mockTileId', 'ANGLE_WALL_3').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    MapRewireAPI.__Rewire__('tileHasName', mockTileHasName);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1],
      [0, 0, 0, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    MapRewireAPI.__ResetDependency__('tileHasName');
    t.end();
  });


  tester.test('returns correctly with angled wall 4, CPTL=4', t => {
    // not entirely traversable
    const mockGetTileProperty = sinon.stub().withArgs('mockTileId', 'traversable').returns(false);
    // does not have radius
    const mockTileHasProperty = sinon.stub().withArgs('mockTileId', 'radius').returns(false);
    // is angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'mockTileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(true);
    // is angle wall 4
    const mockTileHasName = sinon.stub().returns(false);
    mockTileHasName.withArgs('mockTileId', 'ANGLE_WALL_4').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    MapRewireAPI.__Rewire__('tileHasName', mockTileHasName);

    t.same(getTileTraversabilityInCells('mockTileId'), [
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    MapRewireAPI.__ResetDependency__('tileHasName');
    t.end();
  });


  tester.test('throws errors for invalid inputs', t => {
    // if 'frog' is an invalid tileId
    const mockGetTileProperty = sinon.stub().withArgs('frog').throws();
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    t.throws(() => { getTileTraversabilityInCells('frog'); });

    MapRewireAPI.__ResetDependency__('getTileProperty');
    t.end();
  });

  tester.end();
});


test('getMapTraversabilityInCells', tester => {
  tester.test('getMapTraversabilityInCells: stores correct values in tilesToUpdateValues. Calls' +
    ' updateNTSprites once for each non-permanent tile. Returns correct traversability grid.' +
    ' CPTL=1', t => {
    const permNT = 'permNT';
    const tempNT = 'tempNT';
    const permT = 'permT';
    const tempT = 'tempT';
    // mock the results of getTileTraversabilityInCells
    const mockGetTileTraversabilityInCells = sinon.stub();
    mockGetTileTraversabilityInCells.withArgs(permNT).returns([[0]]);
    mockGetTileTraversabilityInCells.withArgs(tempNT).returns([[0]]);
    mockGetTileTraversabilityInCells.withArgs(permT).returns([[1]]);
    mockGetTileTraversabilityInCells.withArgs(tempT).returns([[1]]);
    MapRewireAPI.__Rewire__('getTileTraversabilityInCells', mockGetTileTraversabilityInCells);
    // Mock the results of getTileProperty
    const mockGetTileProperty = sinon.stub();
    mockGetTileProperty.withArgs('permT', 'traversable').returns(true);
    mockGetTileProperty.withArgs('tempT', 'traversable').returns(true);
    mockGetTileProperty.withArgs('permNT', 'traversable').returns(false);
    mockGetTileProperty.withArgs('tempNT', 'traversable').returns(false);
    mockGetTileProperty.withArgs('permT', 'permanent').returns(true);
    mockGetTileProperty.withArgs('permNT', 'permanent').returns(true);
    mockGetTileProperty.withArgs('tempT', 'permanent').returns(false);
    mockGetTileProperty.withArgs('tempT', 'permanent').returns(false);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    let mockMap = [
      [tempT, permT,  tempT],
      [tempT, tempNT, permT],
      [permT, permT,  tempT],
    ];
    const mockTilesToUpdateValues = [tempT, tempT, tempT, tempNT, tempT];
    let mockUpdateNTSprites = sinon.spy();
    MapRewireAPI.__Rewire__('CPTL', 1);
    // the locations of temp tiles
    MapRewireAPI.__Rewire__('tilesToUpdate', [
      { xt: 0, yt: 0 },
      { xt: 0, yt: 2 },
      { xt: 1, yt: 0 },
      { xt: 1, yt: 1 },
      { xt: 2, yt: 2 },
    ]);
    // the current traversability cells
    MapRewireAPI.__Rewire__('mapTraversabilityCells', [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ]);
    MapRewireAPI.__Rewire__('numNTOWithinBufCells', [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ]);
    MapRewireAPI.__Rewire__('mapTraversabilityCellsWithBuf', [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);
    MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
    MapRewireAPI.__Rewire__('areTempNTSpritesDrawn', sinon.stub().returns(false));

    t.same(getMapTraversabilityInCells(mockMap), [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    t.same(mockTilesToUpdateValues, [tempT, tempT, tempT, tempNT, tempT]);
    t.is(mockUpdateNTSprites.callCount, 5);

    mockUpdateNTSprites = sinon.spy();
    MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
    mockMap = [
      [tempT, permT, tempT],
      [tempT, tempT, permT],
      [permT, permT, tempT],
    ];
    t.same(getMapTraversabilityInCells(mockMap), [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ]);
    t.same(mockTilesToUpdateValues, [tempT, tempT, tempT, tempT, tempT]);
    t.is(mockUpdateNTSprites.callCount, 5);

    mockUpdateNTSprites = sinon.spy();
    MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
    // change the gate colors
    mockMap = [
      [tempT, permT, tempT],
      [tempT,  tempNT, permT],
      [permT,  permT, tempT],
    ];
    t.same(getMapTraversabilityInCells(mockMap), [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);

    t.same(mockTilesToUpdateValues, [tempT, tempT, tempT, tempNT, tempT]);
    t.is(mockUpdateNTSprites.callCount, 5);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('mapTraversabilityCells');
    MapRewireAPI.__ResetDependency__('numNTOWithinBufCells');
    MapRewireAPI.__ResetDependency__('mapTraversabilityCellsWithBuf');
    MapRewireAPI.__ResetDependency__('tilesToUpdate');
    MapRewireAPI.__ResetDependency__('tilesToUpdateValues');
    MapRewireAPI.__ResetDependency__('updateNTSprites');
    MapRewireAPI.__ResetDependency__('getTileTraversabilityInCells');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('areTempNTSpritesDrawn');
    t.end();
  });

  tester.end();
});


test('updateNumNTO', tester => {
  tester.test('correctly updates only affected area when numNTO is 5x5, CPTL=1, NTKernel is 3x3,' +
    ' tileTraversability=1', t => {
    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('NTKernel', [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ]);
    const numNTO = [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 1],
      [2, 3, 4, 5, 6],
      [7, 8, 9, 1, 2],
      [3, 4, 5, 6, 7],
    ];
    const xMin = 1;
    const yMin = 1;
    const xMax = 4;
    const yMax = 4;
    const tileTraversability = 1;

    updateNumNTO(numNTO, xMin, yMin, xMax, yMax, tileTraversability);
    t.same(numNTO, [
      [1, 2, 3, 4, 5],
      [6, 6, 7, 8, 1],
      [2, 2, 3, 4, 6],
      [7, 7, 8, 0, 2],
      [3, 4, 5, 6, 7],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('NTKernel');
    t.end();
  });


  tester.test('correctly updates only affected area when numNTO is 5x5, CPTL=2, NTKernel is 3x3,' +
    ' tileTraversability=0', t => {
    MapRewireAPI.__Rewire__('CPTL', 2);
    MapRewireAPI.__Rewire__('NTKernel', [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ]);
    const numNTO = [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 1, 2],
      [3, 4, 5, 6, 7],
      [8, 1, 2, 3, 4],
      [5, 6, 7, 8, 1],
    ];
    const xMin = 1;
    const yMin = 1;
    const xMax = 5;
    const yMax = 5;
    const tileTraversability = 0;

    updateNumNTO(numNTO, xMin, yMin, xMax, yMax, tileTraversability);
    t.same(numNTO, [
      [1, 2, 3, 4, 5],
      [6, 8, 9, 2, 3],
      [3, 5, 6, 7, 8],
      [8, 2, 3, 4, 5],
      [5, 7, 8, 9, 2],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('NTKernel');
    t.end();
  });


  tester.test('correctly throws error when numNTO becomes < 0, numNTO is 3x3, CPTL=1, NTKernel' +
    ' is  3x3, tileTraversability=1', t => {
    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('NTKernel', [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ]);
    const numNTO = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
    ];
    const xMin = 1;
    const yMin = 1;
    const xMax = 4;
    const yMax = 4;
    const tileTraversability = 1;

    t.throws(() => { updateNumNTO(numNTO, xMin, yMin, xMax, yMax, tileTraversability); });

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('NTKernel');
    t.end();
  });

  tester.end();
});


test('initMapTraversabilityCells()', tester => {
  tester.test('correctly updates mapTraversabilityCells, tilesToUpdate, tilesToUpdateValues', t => {
    const permNT = 'permNT';
    const tempNT = 'tempNT';
    const permT = 'permT';
    const tempT = 'tempT';
    const mockGetTileTraversabilityInCells = sinon.stub();
    mockGetTileTraversabilityInCells.withArgs('permNT').returns([[0]]);
    mockGetTileTraversabilityInCells.withArgs('tempNT').returns([[0]]);
    mockGetTileTraversabilityInCells.withArgs('permT').returns([[1]]);
    mockGetTileTraversabilityInCells.withArgs('tempT').returns([[1]]);
    MapRewireAPI.__Rewire__('getTileTraversabilityInCells', mockGetTileTraversabilityInCells);
    const mockGetTileProperty = sinon.stub();
    mockGetTileProperty.withArgs('permT', 'traversable').returns(true);
    mockGetTileProperty.withArgs('tempT', 'traversable').returns(true);
    mockGetTileProperty.withArgs('permNT', 'traversable').returns(false);
    mockGetTileProperty.withArgs('tempNT', 'traversable').returns(false);
    mockGetTileProperty.withArgs('permT', 'permanent').returns(true);
    mockGetTileProperty.withArgs('permNT', 'permanent').returns(true);
    mockGetTileProperty.withArgs('tempT', 'permanent').returns(false);
    mockGetTileProperty.withArgs('tempNT', 'permanent').returns(false);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    const mockUpdateNTSprites = sinon.spy();
    const mockGeneratePermanentNTSprites = sinon.spy();

    const mockMapTraversabilityCells = [];
    const mockMapTraversabilityCellsWithBuf = [];
    const mockNumNTOWithinBufCells = [];
    const mockTilesToUpdate = [];
    const mockTilesToUpdateValues = [];

    const mockMap = [
      [permNT, tempNT, permT],
      [tempT,  tempT,  permNT],
      [permNT, tempNT, permT],
    ];

    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
    MapRewireAPI.__Rewire__('generatePermanentNTSprites', mockGeneratePermanentNTSprites);
    MapRewireAPI.__Rewire__('tilesToUpdate', mockTilesToUpdate);
    MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);
    MapRewireAPI.__Rewire__('mapTraversabilityCells', mockMapTraversabilityCells);
    MapRewireAPI.__Rewire__('mapTraversabilityCellsWithBuf', mockMapTraversabilityCellsWithBuf);
    MapRewireAPI.__Rewire__('numNTOWithinBufCells', mockNumNTOWithinBufCells);


    initMapTraversabilityCells(mockMap);

    t.same(mockMapTraversabilityCells, [
      [0, 0, 1],
      [1, 1, 0],
      [0, 0, 1],
    ]);
    t.same(mockTilesToUpdate, [
      { xt: 0, yt: 1 },
      { xt: 1, yt: 0 },
      { xt: 1, yt: 1 },
      { xt: 2, yt: 1 },
    ]);
    t.same(mockTilesToUpdateValues, [tempNT, tempT, tempT, tempNT]);
    t.is(mockGeneratePermanentNTSprites.callCount, 3); // three permNT objects
    t.is(mockUpdateNTSprites.callCount, 2); // two non-permanent NT objects

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('getTileTraversabilityInCells');
    MapRewireAPI.__ResetDependency__('updateNTSprites');
    MapRewireAPI.__ResetDependency__('generatePermanentNTSprites');
    MapRewireAPI.__ResetDependency__('tilesToUpdate');
    MapRewireAPI.__ResetDependency__('tilesToUpdateValues');
    MapRewireAPI.__ResetDependency__('mapTraversabilityCells');

    t.end();
  });
  tester.end();
});
