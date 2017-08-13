import test from 'tape';
import { getShortestPath } from '../src/helpers/path';

test('test getShortestPath returns shortest path without diagonals', t => {
  const inputMap = [
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const shortestPath = getShortestPath(
    { xc: 0, yc: 0 },
    { xc: 0, yc: 2 },
    inputMap,
    false,
  );
  t.equal(shortestPath.length, 14);

  t.end();
});


test('test getShortestPath returns shortest path with diagonals', t => {
  const inputMap = [
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const shortestDiagonalPath = getShortestPath(
    { xc: 0, yc: 0 },
    { xc: 0, yc: 2 },
    inputMap,
    true,
  );
  t.equal(shortestDiagonalPath.length, 10);

  t.end();
});


test('test getShortestPath returns undefined when no path exists', t => {
  const impossibleMap = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const impossiblePath = getShortestPath(
    { xc: 0, yc: 4 },
    { xc: 5, yc: 5 },
    impossibleMap,
    false,
  );
  t.notOk(impossiblePath);

  t.end();
});


test('test getShortestPath throws error when inputs are out of bounds', t => {
  const impossibleMap = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  t.throws(() => {
    getShortestPath(
      { xc: 6, yc: 3 },
      { xc: 3, yc: 6 },
      impossibleMap,
      false,
    );
  });
  t.throws(() => {
    getShortestPath(
      { xc: 2, yc: 3 },
      { xc: 3, yc: 8 },
      impossibleMap,
      false,
    );
  });

  t.end();
});
