import test from 'tape';
import { getShortestPath } from '../src/helpers/path';

test('test getShortestPath returns shortest path without diagonals', t => {
  const inputMap = [
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const shortestPath = getShortestPath(0, 0, 0, 2, inputMap, false);
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
  const shortestDiagonalPath = getShortestPath(0, 0, 0, 2, inputMap, true);
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
  const impossiblePath = getShortestPath(0, 4, 5, 5, impossibleMap, false);
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
  t.throws(() => { getShortestPath(6, 3, 3, 6, impossibleMap, false); });
  t.throws(() => { getShortestPath(2, 3, 3, 8, impossibleMap, false); });
  t.end();
});
