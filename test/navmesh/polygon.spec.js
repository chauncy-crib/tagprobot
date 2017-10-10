import test from 'tape';
import sinon from 'sinon';
import {
  mapToEdgeTiles,
  unmergedGraphFromTagproMap,
  graphFromTagproMap,
  __RewireAPI__ as PolygonRewireAPI } from '../../src/navmesh/polygon';

test('mapToEdgeTiles returns edges of traversability', t => {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.withArgs(0, 'traversable').returns(false);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);

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

  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  t.end();
});

test('unmergedGraphFromTagproMap', t => {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.withArgs(0, 'traversable').returns(false);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);

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

  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  t.end();
});


test('graphFromTagproMap works for simple case', t => {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.withArgs(0, 'traversable').returns(false);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);

  const map = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0],
  ];
  const graph = graphFromTagproMap(map);
  t.is(graph.getVertices().length, 4);
  t.is(graph.getEdges().length, 4);

  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  t.end();
});


test('graphFromTagproMap works for small square case', t => {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.withArgs(0, 'traversable').returns(false);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);

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


  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  t.end();
});


test('graphFromTagproMap works for hollow square case', t => {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.withArgs(0, 'traversable').returns(false);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);

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

  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  t.end();
});

test('graphFromTagproMap works for diagonal case', t => {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.withArgs(0, 'traversable').returns(false);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);

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

  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  t.end();
});


test('graphFromTagproMap works for complicated graph', t => {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.withArgs(0, 'traversable').returns(false);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
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

  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  t.end();
});


test('graphFromTagproMap works for large graph', t => {
  const mockGetTileProperty = sinon.stub();
  mockGetTileProperty.withArgs(1, 'traversable').returns(true);
  mockGetTileProperty.withArgs(0, 'traversable').returns(false);
  PolygonRewireAPI.__Rewire__('getTileProperty', mockGetTileProperty);
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

  PolygonRewireAPI.__ResetDependency__('getTileProperty');
  t.end();
});
