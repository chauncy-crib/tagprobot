import test from 'tape';
import { getShortestPath } from '../src/helpers/path';

test('test getShortestPath', t => {
  const inputMap = [
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const shortestPath = getShortestPath(0, 0, 0, 2, inputMap, false);
  t.equal(shortestPath.length, 14);
  const shortestDiagonalPath = getShortestPath(0, 0, 0, 2, inputMap, true);
  t.equal(shortestDiagonalPath.length, 10);
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

  t.throws(() => { getShortestPath(6, 3, 3, 6, impossibleMap, false); });
  t.throws(() => { getShortestPath(2, 3, 3, 8, impossibleMap, false); });

  t.end();
});
