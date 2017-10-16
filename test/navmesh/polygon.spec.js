import test from 'tape';
import sinon from 'sinon';
import {
  mapToEdgeTiles,
  unmergedGraphFromTagproMap,
  graphFromTagproMap,
  __RewireAPI__ as PolygonRewireAPI } from '../../src/navmesh/polygon';
import { __RewireAPI__ as TileRewireAPI } from '../../src/tiles';

/* eslint-disable no-multi-spaces array-bracket-spacing */


/**
 * A fake for the purpose of rewiring tileHasName to handle angle walls in unit-tests correctly.
 */
function fakeTileHasName(id, name) {
  if (id === 1.1 && name === 'ANGLE_WALL_1') return true;
  if (id === 1.2 && name === 'ANGLE_WALL_2') return true;
  if (id === 1.3 && name === 'ANGLE_WALL_3') return true;
  if (id === 1.4 && name === 'ANGLE_WALL_4') return true;
  return false;
}

function setup() {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.returns(false);
  const mockTileHasName = sinon.stub().callsFake(fakeTileHasName);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
  PolygonRewireAPI.__Rewire__('tileHasName', mockTileHasName);
  TileRewireAPI.__Rewire__('tileHasName', mockTileHasName);
}

function teardown() {
  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  PolygonRewireAPI.__ResetDependency__('tileHasName');
  TileRewireAPI.__ResetDependency__('tileHasName');
  PolygonRewireAPI.__ResetDependency__('tileIsOneOf');
}


test('mapToEdgeTiles', tester => {
  tester.test('returns edges of traversability', t => {
    setup();
    const map = [
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const edges = mapToEdgeTiles(map);

    t.same(edges, [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 1, y: 6 },
      { x: 1, y: 7 },
      { x: 1, y: 8 },
      { x: 1, y: 9 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 4 },
      { x: 2, y: 7 },
      { x: 2, y: 9 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 3, y: 7 },
      { x: 3, y: 9 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 4, y: 6 },
      { x: 4, y: 7 },
      { x: 4, y: 8 },
      { x: 4, y: 9 },
    ]);

    teardown();
    t.end();
  });

  tester.test('correct number of tiles with diagonals', t => {
    setup();
    // this is an NT diamond in the middle of the map.
    const map = [
      [1, 1,   1,   1,   1,   1],
      [1, 1,   1.4, 1.3, 1,   1],
      [1, 1.4, 0,   0,   1.3, 1],
      [1, 1.1, 0,   0,   1.2, 1],
      [1, 1,   1.1, 1.2, 1,   1],
      [1, 1,   1,   1,   1,   1],
    ];
    const edges = mapToEdgeTiles(map);

    t.is(edges.length, 28);
    t.same(edges, [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 5 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 0 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 4, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 5, y: 5 },
    ]);

    teardown();
    t.end();
  });

  tester.test('diagonal edge of map edge case', t => {
    setup();
    // here, there is a diagonal "point" at the top of the map
    const map = [
      [1, 1, 1.4],
      [1, 1.4, 0],
      [1.4, 0, 0],
      [1.1, 0, 0],
      [1, 1.1, 0],
      [1, 1, 1.1],
    ];
    const edges = mapToEdgeTiles(map);

    t.is(edges.length, 12);

    teardown();
    t.end();
  });

  tester.end();
});

test('unmergedGraphFromTagproMap', tester => {
  tester.test('T and NT tiles', t => {
    setup();
    const map = [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0],
      [0, 1, 0, 1, 0, 0],
      [0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ];
    const graph = unmergedGraphFromTagproMap(map);

    t.is(graph.getEdges().length, 16);
    t.is(graph.getVertices().length, 16);

    teardown();
    t.end();
  });

  tester.test('diagonal walls', t => {
    setup();
    // this is an NT diamond in the middle of the map.
    const map = [
      [1, 1,   1,   1,   1,   1],
      [1, 1,   1.4, 1.3, 1,   1],
      [1, 1.4, 0,   0,   1.3, 1],
      [1, 1.1, 0,   0,   1.2, 1],
      [1, 1,   1.1, 1.2, 1,   1],
      [1, 1,   1,   1,   1,   1],
    ];
    const graph = unmergedGraphFromTagproMap(map);

    t.is(graph.getVertices().length, 32);
    t.is(graph.getEdges().length, 32);
    t.same(graph.getVertices(), [
      { x: 0, y: 0 },
      { x: 0, y: 40 },
      { x: 40, y: 0 },
      { x: 0, y: 80 },
      { x: 0, y: 120 },
      { x: 0, y: 160 },
      { x: 0, y: 200 },
      { x: 0, y: 240 },
      { x: 40, y: 240 },
      { x: 80, y: 0 },
      { x: 40, y: 120 },
      { x: 80, y: 80 },
      { x: 80, y: 160 },
      { x: 80, y: 240 },
      { x: 120, y: 0 },
      { x: 120, y: 40 },
      { x: 120, y: 200 },
      { x: 120, y: 240 },
      { x: 160, y: 0 },
      { x: 160, y: 80 },
      { x: 160, y: 160 },
      { x: 160, y: 240 },
      { x: 200, y: 0 },
      { x: 200, y: 120 },
      { x: 200, y: 240 },
      { x: 240, y: 0 },
      { x: 240, y: 40 },
      { x: 240, y: 80 },
      { x: 240, y: 120 },
      { x: 240, y: 160 },
      { x: 240, y: 200 },
      { x: 240, y: 240 },
    ]);
    t.same(graph.getEdges(), [
      { point1: { x: 0, y: 0 }, point2: { x: 0, y: 40 } },
      { point1: { x: 0, y: 0 }, point2: { x: 40, y: 0 } },
      { point1: { x: 0, y: 40 }, point2: { x: 0, y: 80 } },
      { point1: { x: 0, y: 80 }, point2: { x: 0, y: 120 } },
      { point1: { x: 0, y: 120 }, point2: { x: 0, y: 160 } },
      { point1: { x: 0, y: 160 }, point2: { x: 0, y: 200 } },
      { point1: { x: 0, y: 200 }, point2: { x: 0, y: 240 } },
      { point1: { x: 0, y: 240 }, point2: { x: 40, y: 240 } },
      { point1: { x: 40, y: 0 }, point2: { x: 80, y: 0 } },
      { point1: { x: 40, y: 120 }, point2: { x: 80, y: 80 } },
      { point1: { x: 40, y: 120 }, point2: { x: 80, y: 160 } },
      { point1: { x: 40, y: 240 }, point2: { x: 80, y: 240 } },
      { point1: { x: 80, y: 0 }, point2: { x: 120, y: 0 } },
      { point1: { x: 80, y: 80 }, point2: { x: 120, y: 40 } },
      { point1: { x: 80, y: 160 }, point2: { x: 120, y: 200 } },
      { point1: { x: 80, y: 240 }, point2: { x: 120, y: 240 } },
      { point1: { x: 120, y: 0 }, point2: { x: 160, y: 0 } },
      { point1: { x: 120, y: 40 }, point2: { x: 160, y: 80 } },
      { point1: { x: 120, y: 200 }, point2: { x: 160, y: 160 } },
      { point1: { x: 120, y: 240 }, point2: { x: 160, y: 240 } },
      { point1: { x: 160, y: 0 }, point2: { x: 200, y: 0 } },
      { point1: { x: 160, y: 80 }, point2: { x: 200, y: 120 } },
      { point1: { x: 160, y: 160 }, point2: { x: 200, y: 120 } },
      { point1: { x: 160, y: 240 }, point2: { x: 200, y: 240 } },
      { point1: { x: 240, y: 0 }, point2: { x: 240, y: 40 } },
      { point1: { x: 200, y: 0 }, point2: { x: 240, y: 0 } },
      { point1: { x: 240, y: 40 }, point2: { x: 240, y: 80 } },
      { point1: { x: 240, y: 80 }, point2: { x: 240, y: 120 } },
      { point1: { x: 240, y: 120 }, point2: { x: 240, y: 160 } },
      { point1: { x: 240, y: 160 }, point2: { x: 240, y: 200 } },
      { point1: { x: 240, y: 200 }, point2: { x: 240, y: 240 } },
      { point1: { x: 200, y: 240 }, point2: { x: 240, y: 240 } },
    ]);

    teardown();
    t.end();
  });

  tester.test('diagonal edge of map edge case', t => {
    setup();
    // here, there is a diagonal "point" at the top of the map
    const map = [
      [1, 1, 1.4],
      [1, 1.4, 0],
      [1.4, 0, 0],
      [1.1, 0, 0],
      [1, 1.1, 0],
      [1, 1, 1.1],
    ];
    const graph = unmergedGraphFromTagproMap(map);

    t.is(graph.getVertices().length, 17);
    t.is(graph.getEdges().length, 18);

    teardown();
    t.end();
  });
  tester.end();
});


test('graphFromTagproMap', tester => {
  tester.test('works for simple case', t => {
    setup();
    const map = [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 0, 0],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 4);
    t.is(graph.getEdges().length, 4);

    teardown();
    t.end();
  });

  tester.test('works for small square case', t => {
    setup();
    const map = [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 4);
    t.is(graph.getEdges().length, 4);
    t.same(graph.getVertices(), [
      { x: 40, y: 40 },
      { x: 40, y: 120 },
      { x: 120, y: 40 },
      { x: 120, y: 120 },
    ]);
    t.same(graph.getEdges(), [
      { point1: { x: 40, y: 40 }, point2: { x: 40, y: 120 } },
      { point1: { x: 40, y: 40 }, point2: { x: 120, y: 40 } },
      { point1: { x: 40, y: 120 }, point2: { x: 120, y: 120 } },
      { point1: { x: 120, y: 40 }, point2: { x: 120, y: 120 } },
    ]);

    teardown();
    t.end();
  });

  tester.test('works for hollow square case', t => {
    setup();
    const map = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 8);
    t.is(graph.getEdges().length, 8);

    teardown();
    t.end();
  });
  tester.test('works for diagonal case', t => {
    setup();
    const map = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 6);
    t.is(graph.getEdges().length, 6);

    teardown();
    t.end();
  });

  tester.test('works for complicated graph', t => {
    setup();
    const map = [
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 14);
    t.is(graph.getEdges().length, 14);

    teardown();
    t.end();
  });

  tester.test('works for large graph', t => {
    setup();
    const map = [
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 22);
    t.is(graph.getEdges().length, 22);

    teardown();
    t.end();
  });

  tester.test(': diagonal walls', t => {
    setup();
    // this is an NT diamond in the middle of the map.
    const map = [
      [1, 1,   1,   1,   1,   1],
      [1, 1,   1.4, 1.3, 1,   1],
      [1, 1.4, 0,   0,   1.3, 1],
      [1, 1.1, 0,   0,   1.2, 1],
      [1, 1,   1.1, 1.2, 1,   1],
      [1, 1,   1,   1,   1,   1],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 8);
    t.is(graph.getEdges().length, 8);
    t.same(graph.getEdges(), [
      { point1: { x: 0, y: 240 }, point2: { x: 0, y: 0 } },
      { point1: { x: 40, y: 120 }, point2: { x: 120, y: 40 } },
      { point1: { x: 40, y: 120 }, point2: { x: 120, y: 200 } },
      { point1: { x: 120, y: 40 }, point2: { x: 200, y: 120 } },
      { point1: { x: 120, y: 200 }, point2: { x: 200, y: 120 } },
      { point1: { x: 240, y: 0 }, point2: { x: 0, y: 0 } },
      { point1: { x: 240, y: 240 }, point2: { x: 0, y: 240 } },
      { point1: { x: 240, y: 240 }, point2: { x: 240, y: 0 } },
    ]);

    teardown();
    t.end();
  });

  tester.test(': diagonal edge of map edge case', t => {
    setup();
    // here, there is a diagonal "point" at the top of the map
    const map = [
      [1, 1, 1.4],
      [1, 1.4, 0],
      [1.4, 0, 0],
      [1.1, 0, 0],
      [1, 1.1, 0],
      [1, 1, 1.1],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 5);
    t.is(graph.getEdges().length, 5);
    t.same(graph.getVertices(), [
      { x: 0, y: 0 }, { x: 0, y: 120 }, { x: 120, y: 0 }, { x: 240, y: 0 }, { x: 240, y: 120 },
    ]);

    teardown();
    t.end();
  });

  tester.test(': diagonal on empty space', t => {
    setup();
    const map = [
      [1,   1,   1,   1.4],
      [1,   1,   1.4, 1.2],
      [1,   1.4, 1.2, 0  ],
      [1.4, 1.2, 0,   0  ],
    ];
    const graph = graphFromTagproMap(map);

    t.is(graph.getVertices().length, 3);
    t.is(graph.getEdges().length, 3);

    teardown();
    t.end();
  });

  tester.end();
});
