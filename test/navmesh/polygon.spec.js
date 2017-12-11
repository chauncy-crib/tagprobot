import test from 'tape';
import sinon from 'sinon';
import { PPTL } from '../../src/constants';
import {
  mapToEdgeTiles,
  unmergedGraphFromTagproMap,
  graphFromTagproMap,
  updateUnmergedGraph,
  updateMergedGraph,
  __RewireAPI__ as PolygonRewireAPI } from '../../src/navmesh/polygon';
import { Point } from '../../src/navmesh/graph';
import { __RewireAPI__ as TileRewireAPI } from '../../src/tiles';
import { setupTiles, teardownTiles } from '../setupTiles';

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
  // PolygonRewireAPI.__ResetDependency__('tileIsOneOf');
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
      { xt: 0, yt: 1 },
      { xt: 1, yt: 1 },
      { xt: 1, yt: 4 },
      { xt: 1, yt: 5 },
      { xt: 1, yt: 6 },
      { xt: 1, yt: 7 },
      { xt: 1, yt: 8 },
      { xt: 1, yt: 9 },
      { xt: 2, yt: 1 },
      { xt: 2, yt: 2 },
      { xt: 2, yt: 4 },
      { xt: 2, yt: 7 },
      { xt: 2, yt: 9 },
      { xt: 3, yt: 1 },
      { xt: 3, yt: 2 },
      { xt: 3, yt: 4 },
      { xt: 3, yt: 7 },
      { xt: 3, yt: 9 },
      { xt: 4, yt: 1 },
      { xt: 4, yt: 2 },
      { xt: 4, yt: 4 },
      { xt: 4, yt: 5 },
      { xt: 4, yt: 6 },
      { xt: 4, yt: 7 },
      { xt: 4, yt: 8 },
      { xt: 4, yt: 9 },
    ]);

    teardown();
    t.end();
  });

  tester.test('correct number of tiles with diagonals', t => {
    setup();
    // This is an NT diamond in the middle of the map.
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
      { xt: 0, yt: 0 },
      { xt: 0, yt: 1 },
      { xt: 0, yt: 2 },
      { xt: 0, yt: 3 },
      { xt: 0, yt: 4 },
      { xt: 0, yt: 5 },
      { xt: 1, yt: 0 },
      { xt: 1, yt: 2 },
      { xt: 1, yt: 3 },
      { xt: 1, yt: 5 },
      { xt: 2, yt: 0 },
      { xt: 2, yt: 1 },
      { xt: 2, yt: 4 },
      { xt: 2, yt: 5 },
      { xt: 3, yt: 0 },
      { xt: 3, yt: 1 },
      { xt: 3, yt: 4 },
      { xt: 3, yt: 5 },
      { xt: 4, yt: 0 },
      { xt: 4, yt: 2 },
      { xt: 4, yt: 3 },
      { xt: 4, yt: 5 },
      { xt: 5, yt: 0 },
      { xt: 5, yt: 1 },
      { xt: 5, yt: 2 },
      { xt: 5, yt: 3 },
      { xt: 5, yt: 4 },
      { xt: 5, yt: 5 },
    ]);

    teardown();
    t.end();
  });

  tester.test('diagonal edge of map edge case', t => {
    setup();
    // Here, there is a diagonal "point" at the top of the map
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
  tester.test('draws edges around the outside and inside of a hollow square', t => {
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

  tester.test('draws edges around outside and inside of square rotated 45 degrees', t => {
    setup();
    // This is an NT diamond in the middle of the map.
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
    t.is(graph.getEdges().length, 32);
    t.true(graph.isConnected(new Point(0, 0), new Point(0, 40)));
    t.true(graph.isConnected(new Point(0, 0), new Point(40, 0)));
    t.true(graph.isConnected(new Point(0, 40), new Point(0, 80)));
    t.true(graph.isConnected(new Point(0, 80), new Point(0, 120)));
    t.true(graph.isConnected(new Point(0, 120), new Point(0, 160)));
    t.true(graph.isConnected(new Point(0, 160), new Point(0, 200)));
    t.true(graph.isConnected(new Point(0, 200), new Point(0, 240)));
    t.true(graph.isConnected(new Point(0, 240), new Point(40, 240)));
    t.true(graph.isConnected(new Point(40, 0), new Point(80, 0)));
    t.true(graph.isConnected(new Point(40, 120), new Point(80, 80)));
    t.true(graph.isConnected(new Point(40, 120), new Point(80, 160)));
    t.true(graph.isConnected(new Point(40, 240), new Point(80, 240)));
    t.true(graph.isConnected(new Point(80, 0), new Point(120, 0)));
    t.true(graph.isConnected(new Point(80, 80), new Point(120, 40)));
    t.true(graph.isConnected(new Point(80, 160), new Point(120, 200)));
    t.true(graph.isConnected(new Point(80, 240), new Point(120, 240)));
    t.true(graph.isConnected(new Point(120, 0), new Point(160, 0)));
    t.true(graph.isConnected(new Point(120, 40), new Point(160, 80)));
    t.true(graph.isConnected(new Point(120, 200), new Point(160, 160)));
    t.true(graph.isConnected(new Point(120, 240), new Point(160, 240)));
    t.true(graph.isConnected(new Point(160, 0), new Point(200, 0)));
    t.true(graph.isConnected(new Point(160, 80), new Point(200, 120)));
    t.true(graph.isConnected(new Point(160, 160), new Point(200, 120)));
    t.true(graph.isConnected(new Point(160, 240), new Point(200, 240)));
    t.true(graph.isConnected(new Point(240, 0), new Point(240, 40)));
    t.true(graph.isConnected(new Point(200, 0), new Point(240, 0)));
    t.true(graph.isConnected(new Point(240, 40), new Point(240, 80)));
    t.true(graph.isConnected(new Point(240, 80), new Point(240, 120)));
    t.true(graph.isConnected(new Point(240, 120), new Point(240, 160)));
    t.true(graph.isConnected(new Point(240, 160), new Point(240, 200)));
    t.true(graph.isConnected(new Point(240, 200), new Point(240, 240)));
    t.true(graph.isConnected(new Point(200, 240), new Point(240, 240)));

    teardown();
    t.end();
  });

  tester.test('draws edges correctly when two diagonal walls meet at the edge of the map', t => {
    setup();
    // Here, there is a diagonal "point" at the top of the map
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
  tester.test('simple case', t => {
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

  tester.test('small square case', t => {
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
      { p1: { x: 40, y: 40 }, p2: { x: 40, y: 120 } },
      { p1: { x: 40, y: 40 }, p2: { x: 120, y: 40 } },
      { p1: { x: 40, y: 120 }, p2: { x: 120, y: 120 } },
      { p1: { x: 120, y: 40 }, p2: { x: 120, y: 120 } },
    ]);

    teardown();
    t.end();
  });

  tester.test('hollow square case', t => {
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
  tester.test('two squares touching at the corner', t => {
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

    t.is(graph.getVertices().length, 7);
    t.is(graph.getEdges().length, 8);

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

  tester.test('draws edges around outside and inside of square rotated 45 degrees', t => {
    setup();
    // This is an NT diamond in the middle of the map.
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
    t.true(graph.isConnected(new Point(0, 240), new Point(0, 0)));
    t.true(graph.isConnected(new Point(40, 120), new Point(120, 40)));
    t.true(graph.isConnected(new Point(40, 120), new Point(120, 200)));
    t.true(graph.isConnected(new Point(120, 40), new Point(200, 120)));
    t.true(graph.isConnected(new Point(120, 200), new Point(200, 120)));
    t.true(graph.isConnected(new Point(240, 0), new Point(0, 0)));
    t.true(graph.isConnected(new Point(240, 240), new Point(0, 240)));
    t.true(graph.isConnected(new Point(240, 240), new Point(240, 0)));

    teardown();
    t.end();
  });

  tester.test('draws edges correctly when two diagonal walls meet at the edge of the map', t => {
    setup();
    // Here, there is a diagonal "point" at the top of the map
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
    t.is(graph.getEdges().length, 6);
    t.same(graph.getVertices(), [
      { x: 0, y: 0 }, { x: 0, y: 120 }, { x: 120, y: 0 }, { x: 240, y: 0 }, { x: 240, y: 120 },
    ]);

    teardown();
    t.end();
  });

  tester.test('Does not draw polygons around diagonal walls surrounded by NT tiles', t => {
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


test('updateUnmergedGraph', tester => {
  tester.test('splits apart line of bombs', t => {
    setupTiles();
    const map = [
      [2, 2, 2,  2,  2,  2,  2,  2,  2, 2, 2],
      [2, 2, 10, 10, 10, 10, 10, 10, 2, 2, 2],
      [2, 2, 2,  2,  2,  2,  2,  2,  2, 2, 2],
    ];
    const unmergedGraph = unmergedGraphFromTagproMap(map);
    t.is(unmergedGraph.numVertices(), 42);
    t.is(unmergedGraph.numEdges(), 42);
    map[1][5] = '10.1'; // inactive bomb
    updateUnmergedGraph(unmergedGraph, map, 1, 5);
    t.is(unmergedGraph.numVertices(), 42);
    t.is(unmergedGraph.numEdges(), 42);
    t.false(unmergedGraph.isConnected(
      new Point(1 * PPTL, 5 * PPTL),
      new Point(1 * PPTL, 6 * PPTL),
    ));
    t.false(unmergedGraph.isConnected(
      new Point(2 * PPTL, 5 * PPTL),
      new Point(2 * PPTL, 6 * PPTL),
    ));
    t.true(unmergedGraph.isConnected(
      new Point(1 * PPTL, 5 * PPTL),
      new Point(2 * PPTL, 5 * PPTL),
    ));
    t.true(unmergedGraph.isConnected(
      new Point(1 * PPTL, 6 * PPTL),
      new Point(2 * PPTL, 6 * PPTL),
    ));
    map[1][5] = 10; // change it back to a bomb
    updateUnmergedGraph(unmergedGraph, map, 1, 5);
    t.is(unmergedGraph.numVertices(), 42);
    t.is(unmergedGraph.numEdges(), 42);
    t.true(unmergedGraph.isConnected(
      new Point(1 * PPTL, 5 * PPTL),
      new Point(1 * PPTL, 6 * PPTL),
    ));
    t.true(unmergedGraph.isConnected(
      new Point(2 * PPTL, 5 * PPTL),
      new Point(2 * PPTL, 6 * PPTL),
    ));
    t.false(unmergedGraph.isConnected(
      new Point(1 * PPTL, 5 * PPTL),
      new Point(2 * PPTL, 5 * PPTL),
    ));
    t.false(unmergedGraph.isConnected(
      new Point(1 * PPTL, 6 * PPTL),
      new Point(2 * PPTL, 6 * PPTL),
    ));
    teardownTiles();
    t.end();
  });
});


test('updateMergedGraph', tester => {
  tester.test('splits apart line of bombs', t => {
    setupTiles();
    const map = [
      [2, 2, 2,  2,  2,  2,  2,  2,  2, 2, 2],
      [2, 2, 10, 10, 10, 10, 10, 10, 2, 2, 2],
      [2, 2, 2,  2,  2,  2,  2,  2,  2, 2, 2],
    ];
    const unmergedGraph = unmergedGraphFromTagproMap(map);
    const mergedGraph = graphFromTagproMap(map);
    t.is(mergedGraph.numVertices(), 8);
    t.is(mergedGraph.numEdges(), 8);
    map[1][5] = '10.1'; // inactive bomb
    updateUnmergedGraph(unmergedGraph, map, 1, 5);
    updateMergedGraph(mergedGraph, unmergedGraph, map, 1, 5);
    t.is(mergedGraph.numVertices(), 12);
    t.is(mergedGraph.numEdges(), 12);
    t.true(true);
    teardownTiles();
    t.end();
  });
});
