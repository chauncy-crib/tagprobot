import _ from 'lodash';
import test from 'tape';
import { getShortestPath, GameState, projectedLocation, __RewireAPI__ as PathRewireAPI } from '../src/helpers/path';


test('test projectedLocation: returns correct final destinations', t => {
  t.same(projectedLocation(1, -2, -3, 1, 2, 1, 2), {
    x: -1,
    y: 2,
  });
  t.end();
});


test('test neighbors returns the right number of neighbors with diagonals on', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],

  ];
  PathRewireAPI.__Rewire__('diagonal', true);

  let state = new GameState(1, 1);
  t.is(state.neighbors(traversabilityCells).length, 5);

  state = new GameState(1, 0);
  t.is(state.neighbors(traversabilityCells).length, 3);

  state = new GameState(0, 2);
  t.is(state.neighbors(traversabilityCells).length, 1);

  state = new GameState(2, 2);
  t.is(state.neighbors(traversabilityCells).length, 2);

  PathRewireAPI.__ResetDependency__('diagonal');
  t.end();
});


test('test neighbors returns the right number of neighbors with diagonals off', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  PathRewireAPI.__Rewire__('diagonal', false);

  let state = new GameState(1, 1);
  t.is(state.neighbors(traversabilityCells).length, 2);

  state = new GameState(1, 0);
  t.is(state.neighbors(traversabilityCells).length, 2);

  state = new GameState(0, 2);
  t.is(state.neighbors(traversabilityCells).length, 0);

  state = new GameState(2, 2);
  t.is(state.neighbors(traversabilityCells).length, 1);

  PathRewireAPI.__ResetDependency__('diagonal');
  t.end();
});


test('test neighbors have correct g values', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  PathRewireAPI.__Rewire__('diagonal', false);

  const state = new GameState(1, 1);
  state.g = 12;
  _.each(state.neighbors(traversabilityCells), n => {
    t.is(n.g, 13);
  });
  PathRewireAPI.__ResetDependency__('diagonal');
  t.end();
});


test('test getShortestPath returns shortest path without diagonals', t => {
  PathRewireAPI.__Rewire__('diagonal', false);
  const inputMap = [
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const shortestPath = getShortestPath(
    0, 0,
    { xc: 0, yc: 2 },
    inputMap,
  );
  t.equal(shortestPath.length, 14);
  PathRewireAPI.__ResetDependency__('diagonal');

  t.end();
});


test('test getShortestPath returns shortest path with diagonals', t => {
  PathRewireAPI.__Rewire__('diagonal', true);
  const inputMap = [
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const shortestDiagonalPath = getShortestPath(
    0, 0,
    { xc: 0, yc: 2 },
    inputMap,
  );
  t.equal(shortestDiagonalPath.length, 10);
  PathRewireAPI.__ResetDependency__('diagonal');

  t.end();
});


test('test getShortestPath returns undefined when no path exists', t => {
  PathRewireAPI.__Rewire__('diagonal', true);
  const impossibleMap = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const impossiblePath = getShortestPath(
    0, 4,
    { xc: 5, yc: 5 },
    impossibleMap,
  );
  t.notOk(impossiblePath);

  PathRewireAPI.__ResetDependency__('diagonal');
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
      6, 3,
      { xc: 3, yc: 6 },
      impossibleMap,
    );
  });
  t.throws(() => {
    getShortestPath(
      2, 3,
      { xc: 3, yc: 8 },
      impossibleMap,
    );
  });

  t.end();
});


test('test getShortestPath returns the shortest path when the greedy algorithm returns the wrong path', t => {
  PathRewireAPI.__Rewire__('diagonal', false);
  const map = [
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const shortestDiagonalPath = getShortestPath(
    0, 2,
    { xc: 8, yc: 28 },
    map,
  );
  t.is(shortestDiagonalPath.length, 62);
  PathRewireAPI.__ResetDependency__('diagonal');

  t.end();
});
