import test from 'tape';
import sinon from 'sinon';
import {
  mapToEdgeTiles,
  polygonsFromTagproMap,
  __RewireAPI__ as PolygonRewireAPI} from '../../src/navmesh/polygon';

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
