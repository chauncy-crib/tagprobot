import test from 'tape';
import sinon from 'sinon';
import {
  initMapTraversabilityCells,
  init2dArray,
  fillGridWithSubgrid,
  getTileTraversabilityInCells,
  getMapTraversabilityInCells,
  __RewireAPI__ as MapRewireAPI,
} from '../../src/helpers/map';


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
    const mockGetTileProperty = sinon.stub().withArgs('tileId', 'traversable').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);

    t.same(getTileTraversabilityInCells('tileId'), [
      [1],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    t.end();
  });


  tester.test('returns correctly with entirely nontraversable tile, CPTL=1', t => {
    // not fully traversable
    const mockGetTileProperty = sinon.stub().withArgs('tileId', 'traversable').returns(false);
    // has no radius
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(false);
    // is not angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(false);
    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('tileId'), [
      [0],
    ]);

    MapRewireAPI.__ResetDependency__('CPTL');
    MapRewireAPI.__ResetDependency__('getTileProperty');
    MapRewireAPI.__ResetDependency__('tileHasProperty');
    MapRewireAPI.__ResetDependency__('tileIsOneOf');
    t.end();
  });


  tester.test('returns correctly with entirely traversable tile, CPTL=4', t => {
    // not fully traversable
    const mockGetTileProperty = sinon.stub().withArgs('tileId', 'traversable').returns(false);
    // has no radius
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(false);
    // is not angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(false);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('tileId'), [
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


  tester.test('returns correctly with CNTO and small radius, CPTL=4', t => {
    const mockGetTileProperty = sinon.stub();
    // not fully traversable
    mockGetTileProperty.withArgs('tileId', 'traversable').returns(false);
    // radius of 14
    mockGetTileProperty.withArgs('tileId', 'radius').returns(14);
    // has radius
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(true);
    // is not angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(false);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('PPCL', 10);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('tileId'), [
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


  tester.test('returns correctly with CNTO and false radius, CPTL=4', t => {
    const mockGetTileProperty = sinon.stub();
    // not fully traversable
    mockGetTileProperty.withArgs('tileId', 'traversable').returns(false);
    // radius of 15
    mockGetTileProperty.withArgs('tileId', 'radius').returns(15);
    // has radius
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(true);
    // is not angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(false);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('PPCL', 10);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    t.same(getTileTraversabilityInCells('tileId'), [
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


  tester.test('returns correctly with angled wall 1, CPTL=4', t => {
    // not fully traversable
    const mockGetTileProperty = sinon.stub().withArgs('tileId', 'traversable').returns(false);
    // does not has radius
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(false);
    // is angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(true);
    // is angle wall 1
    const mockTileHasName = sinon.stub().returns(false);
    mockTileHasName.withArgs('tileId', 'ANGLE_WALL_1').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    MapRewireAPI.__Rewire__('tileHasName', mockTileHasName);
    t.same(getTileTraversabilityInCells('tileId'), [
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
    // not fully traversable
    const mockGetTileProperty = sinon.stub().withArgs('tileId', 'traversable').returns(false);
    // does not has radius
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(false);
    // is angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(true);
    // is angle wall 2
    const mockTileHasName = sinon.stub().returns(false);
    mockTileHasName.withArgs('tileId', 'ANGLE_WALL_2').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    MapRewireAPI.__Rewire__('tileHasName', mockTileHasName);
    t.same(getTileTraversabilityInCells('tileId'), [
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
    // not fully traversable
    const mockGetTileProperty = sinon.stub().withArgs('tileId', 'traversable').returns(false);
    // does not has radius
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(false);
    // is angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(true);
    // is angle wall 3
    const mockTileHasName = sinon.stub().returns(false);
    mockTileHasName.withArgs('tileId', 'ANGLE_WALL_3').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    MapRewireAPI.__Rewire__('tileHasName', mockTileHasName);
    t.same(getTileTraversabilityInCells('tileId'), [
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
    // not fully traversable
    const mockGetTileProperty = sinon.stub().withArgs('tileId', 'traversable').returns(false);
    // does not has radius
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(false);
    // is angle wall
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(true);
    // is angle wall 4
    const mockTileHasName = sinon.stub().returns(false);
    mockTileHasName.withArgs('tileId', 'ANGLE_WALL_4').returns(true);
    MapRewireAPI.__Rewire__('CPTL', 4);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);
    MapRewireAPI.__Rewire__('tileHasName', mockTileHasName);
    t.same(getTileTraversabilityInCells('tileId'), [
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


  tester.test('returns correctly with nontraversable tile, CPTL=8', t => {
    const mockGetTileProperty = sinon.stub();
    // not fully traversable
    mockGetTileProperty.withArgs('tileId', 'traversable').returns(false);
    mockGetTileProperty.withArgs('tileId', 'radius').returns(8);
    const mockTileHasProperty = sinon.stub().withArgs('tileId', 'radius').returns(true);
    const mockTileIsOneOf = sinon.stub().withArgs(
      'tileId',
      ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
    ).returns(false);
    MapRewireAPI.__Rewire__('CPTL', 8);
    MapRewireAPI.__Rewire__('PPCL', 5);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('tileHasProperty', mockTileHasProperty);
    MapRewireAPI.__Rewire__('tileIsOneOf', mockTileIsOneOf);

    t.same(getTileTraversabilityInCells('tileId'), [ // button
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ]);
    mockGetTileProperty.withArgs('tileId', 'radius').returns(14);
    t.same(getTileTraversabilityInCells('tileId'), [ // spike
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


test('getMapTraversabilityInCells: returns correctly with CPTL=1', t => {
  MapRewireAPI.__Rewire__('CPTL', 1);

  const permNT = 'permNT';
  const tempNT = 'tempNT';
  const permT = 'permT';
  const tempT = 'tempT';

  // mock the results of getTileTraversabilityInCells
  const mockGetTileTraversabilityInCells = sinon.stub();
  mockGetTileTraversabilityInCells.withArgs(permNT).returns([['PERM_NT']]);
  mockGetTileTraversabilityInCells.withArgs(tempNT).returns([['TEMP_NT']]);
  mockGetTileTraversabilityInCells.withArgs(permT).returns([['PERM_T']]);
  mockGetTileTraversabilityInCells.withArgs(tempT).returns([['TEMP_T']]);
  MapRewireAPI.__Rewire__('getTileTraversabilityInCells', mockGetTileTraversabilityInCells);

  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockMap = [
    [ tempNT, permT,  tempNT ],
    [ tempNT, tempT,  permT  ],
    [ permT,  permNT, tempNT ],
  ];
  // the locations of temp tiles
  MapRewireAPI.__Rewire__('tilesToUpdate', [
    { x: 0, y: 0 },
    { x: 0, y: 2 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ]);
  // the current traversability cells
  MapRewireAPI.__Rewire__('mapTraversabilityCells', [
    [ 'TEMP_NT', 'PERM_T',  'TEMP_NT' ],
    [ 'TEMP_NT', 'TEMP_T',  'PERM_T'  ],
    [ 'PERM_T',  'PERM_NT', 'TEMP_NT' ],
  ]);
  const mockTilesToUpdateValues = [tempNT, tempNT, tempNT, tempT, tempNT];
  MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);
  let mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);

  t.same(getMapTraversabilityInCells(mockMap), [
    [ 'TEMP_NT', 'PERM_T',  'TEMP_NT' ],
    [ 'TEMP_NT', 'TEMP_T',  'PERM_T'  ],
    [ 'PERM_T',  'PERM_NT', 'TEMP_NT' ],
  ]);
  t.same(mockTilesToUpdateValues, [tempNT, tempNT, tempNT, tempT, tempNT]);
  t.is(mockUpdateNTSprites.callCount, 5);

  mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
  mockMap[0][0] = tempT;
  t.same(getMapTraversabilityInCells(mockMap), [
    [ 'TEMP_T', 'PERM_T',  'TEMP_NT' ],
    [ 'TEMP_NT', 'TEMP_T',  'PERM_T'  ],
    [ 'PERM_T',  'PERM_NT', 'TEMP_NT' ],
  ]);
  t.same(mockTilesToUpdateValues, [tempT, tempNT, tempNT, tempT, tempNT]);
  t.is(mockUpdateNTSprites.callCount, 5);

  mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
  // change the gate colors
  mockMap[0][2] = tempT;
  mockMap[1][0] = tempT;
  mockMap[1][1] = tempNT;
  t.same(getMapTraversabilityInCells(mockMap), [
    [ 'TEMP_T', 'PERM_T',  'TEMP_T' ],
    [ 'TEMP_T', 'TEMP_NT',  'PERM_T'  ],
    [ 'PERM_T',  'PERM_NT', 'TEMP_NT' ],
  ]);
  t.same(mockTilesToUpdateValues, [tempT, tempT, tempT, tempNT, tempNT]);
  t.is(mockUpdateNTSprites.callCount, 5);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('mapTraversabilityCells');
  MapRewireAPI.__ResetDependency__('tilesToUpdate');
  MapRewireAPI.__ResetDependency__('tilesToUpdateValues');
  MapRewireAPI.__ResetDependency__('updateNTSprites');
  MapRewireAPI.__ResetDependency__('getTileTraversabilityInCells');

  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  t.end();
});


test('getMapTraversabilityInCells: returns correctly with CPTL=3', t => {
  MapRewireAPI.__Rewire__('CPTL', 3);
  // create a dummy map. Assume all objects 
  const tempNT = 'tempNT';
  const tempT = 'tempT';

  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockGetTileTraversabilityInCells = sinon.stub();
  mockGetTileTraversabilityInCells.withArgs(tempNT).returns([
    ['b', 'b', 'b'],
    ['b', 'a', 'b'],
    ['b', 'b', 'b'],
  ]);
  mockGetTileTraversabilityInCells.withArgs(tempT).returns([
    ['c', 'c', 'c'],
    ['c', 'd', 'c'],
    ['c', 'c', 'c'],
  ]);
  MapRewireAPI.__Rewire__('getTileTraversabilityInCells', mockGetTileTraversabilityInCells);

  const mockMap = [[tempNT, tempT]];
  MapRewireAPI.__Rewire__('tilesToUpdate', [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
  ]);
  MapRewireAPI.__Rewire__('mapTraversabilityCells', [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
  ]);
  const mockTilesToUpdateValues = [tempT, tempNT];
  MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);
  const mockUpdateNTSprites = sinon.spy();
  MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);

  t.same(getMapTraversabilityInCells(mockMap), [
    ['b', 'b', 'b', 'c', 'c', 'c'],
    ['b', 'a', 'b', 'c', 'd', 'c'],
    ['b', 'b', 'b', 'c', 'c', 'c'],
  ]);
  t.same(mockTilesToUpdateValues, [tempNT, tempT]);
  t.is(mockUpdateNTSprites.callCount, 2);

  MapRewireAPI.__ResetDependency__('CPTL');
  MapRewireAPI.__ResetDependency__('mapTraversabilityCells');
  MapRewireAPI.__ResetDependency__('tilesToUpdate');
  MapRewireAPI.__ResetDependency__('tilesToUpdateValues');
  MapRewireAPI.__ResetDependency__('updateNTSprites');
  MapRewireAPI.__ResetDependency__('getTileTraversabilityInCells');

  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  t.end();
});


test('initMapTraversabilityCells()', tester => {
  tester.test('correctly updates mapTraversabilityCells, tilesToUpdate, tilesToUpdateValues', t => {
    const permNT = 'permNT';
    const tempNT = 'tempNT';
    const permT = 'permT';
    const tempT = 'tempT';
    const mockGetTileTraversabilityInCells = sinon.stub();
    mockGetTileTraversabilityInCells.withArgs('permNT').returns([['a']]);
    mockGetTileTraversabilityInCells.withArgs('tempNT').returns([['b']]);
    mockGetTileTraversabilityInCells.withArgs('permT').returns([['c']]);
    mockGetTileTraversabilityInCells.withArgs('tempT').returns([['d']]);
    const mockGetTileProperty = sinon.stub();
    mockGetTileProperty.withArgs('permT', 'traversable').returns(true);
    mockGetTileProperty.withArgs('tempT', 'traversable').returns(true);
    mockGetTileProperty.withArgs('permT', 'permanent').returns(true);
    mockGetTileProperty.withArgs('permNT', 'permanent').returns(true);
    mockGetTileProperty.returns(false);
    const mockUpdateNTSprites = sinon.spy();
    const mockGeneratePermanentNTSprites = sinon.spy();

    const mockMapTraversabilityCells = [];
    const mockTilesToUpdate = [];
    const mockTilesToUpdateValues = [];

    /* eslint-disable no-multi-spaces, array-bracket-spacing */
    const mockMap = [
      [permNT, tempNT, permT],
      [tempT,  tempT,  permNT],
      [permNT, tempNT, permT],
    ];
    /* eslint-enable no-multi-spaces, array-bracket-spacing */

    MapRewireAPI.__Rewire__('CPTL', 1);
    MapRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
    MapRewireAPI.__Rewire__('getTileTraversabilityInCells', mockGetTileTraversabilityInCells);
    MapRewireAPI.__Rewire__('updateNTSprites', mockUpdateNTSprites);
    MapRewireAPI.__Rewire__('generatePermanentNTSprites', mockGeneratePermanentNTSprites);
    MapRewireAPI.__Rewire__('tilesToUpdate', mockTilesToUpdate);
    MapRewireAPI.__Rewire__('tilesToUpdateValues', mockTilesToUpdateValues);
    MapRewireAPI.__Rewire__('mapTraversabilityCells', mockMapTraversabilityCells);


    initMapTraversabilityCells(mockMap);

    t.same(mockMapTraversabilityCells, [
      ['a', 'b', 'c'],
      ['d', 'd', 'a'],
      ['a', 'b', 'c'],
    ]);
    t.same(mockTilesToUpdate, [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]);
    t.same(mockTilesToUpdateValues, [tempNT, tempT, tempT, tempNT]);
    t.ok(mockGeneratePermanentNTSprites.calledThrice); // three permNT objects
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
