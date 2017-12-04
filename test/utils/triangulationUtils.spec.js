import test from 'tape';
import { shouldHaveTriangulationVertex } from '../../src/utils/triangulationUtils';
import { setupTiles, teardownTiles } from '../setupTiles';

test('shouldHaveTriangulationVertex: handles case when squares meet at corner', t => {
  setupTiles();
  const map = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 0],
    [0, 0, 0, 0, 2, 2, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ];

  t.true(shouldHaveTriangulationVertex(map, 3, 4)); // squares intersection
  t.true(shouldHaveTriangulationVertex(map, 1, 4)); // top right corner
  t.false(shouldHaveTriangulationVertex(map, 2, 3)); // middle of a square
  t.false(shouldHaveTriangulationVertex(map, 1, 3)); // top middle of a square
  t.false(shouldHaveTriangulationVertex(map, 4, 5)); // middle of other square
  t.false(shouldHaveTriangulationVertex(map, 0, 0)); // top left corner of map
  t.false(shouldHaveTriangulationVertex(map, 4, 1)); // top left corner of map
  let triangulationVertices = 0;
  for (let x = 0; x <= map.length; x += 1) {
    for (let y = 0; y <= map[0].length; y += 1) {
      if (shouldHaveTriangulationVertex(map, x, y)) {
        triangulationVertices += 1;
      }
    }
  }
  t.is(triangulationVertices, 7);

  teardownTiles();
  t.end();
});


test('shouldHaveTriangulationVertex: handles case when two angle walls meet at edge of map', t => {
  setupTiles();
  // Here, there is a diagonal "point" at the top of the map
  const map = [
    [2, 2, 1.4],
    [2, 1.4, 0],
    [1.4, 0, 0],
    [1.1, 0, 0],
    [2, 1.1, 0],
    [2, 2, 1.1],
  ];
  t.true(shouldHaveTriangulationVertex(map, 0, 0));
  t.true(shouldHaveTriangulationVertex(map, 3, 0));
  t.true(shouldHaveTriangulationVertex(map, 0, 3));
  t.true(shouldHaveTriangulationVertex(map, 6, 0));
  t.true(shouldHaveTriangulationVertex(map, 6, 3));
  let triangulationVertices = 0;
  for (let x = 0; x <= map.length; x += 1) {
    for (let y = 0; y <= map[0].length; y += 1) {
      if (shouldHaveTriangulationVertex(map, x, y)) {
        triangulationVertices += 1;
      }
    }
  }
  t.is(triangulationVertices, 5);

  teardownTiles();
  t.end();
});
