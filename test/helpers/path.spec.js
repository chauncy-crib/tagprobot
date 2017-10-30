import _ from 'lodash';
import test from 'tape';
import { getShortestPath, GameState, __RewireAPI__ as PathRewireAPI } from '../../src/helpers/path';


test('test neighbors returns the right number of neighbors with diagonals on', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],

  ];
  PathRewireAPI.__Rewire__('DIAGONAL', true);

  let state = new GameState(1, 1);
  t.is(state.neighbors(traversabilityCells).length, 5);

  state = new GameState(1, 0);
  t.is(state.neighbors(traversabilityCells).length, 3);

  state = new GameState(0, 2);
  t.is(state.neighbors(traversabilityCells).length, 1);

  state = new GameState(2, 2);
  t.is(state.neighbors(traversabilityCells).length, 2);

  PathRewireAPI.__ResetDependency__('DIAGONAL');
  t.end();
});


test('test neighbors returns the right number of neighbors with diagonals off', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  PathRewireAPI.__Rewire__('DIAGONAL', false);

  let state = new GameState(1, 1);
  t.is(state.neighbors(traversabilityCells).length, 2);

  state = new GameState(1, 0);
  t.is(state.neighbors(traversabilityCells).length, 2);

  state = new GameState(0, 2);
  t.is(state.neighbors(traversabilityCells).length, 0);

  state = new GameState(2, 2);
  t.is(state.neighbors(traversabilityCells).length, 1);

  PathRewireAPI.__ResetDependency__('DIAGONAL');
  t.end();
});


test('test neighbors have correct g values', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  PathRewireAPI.__Rewire__('DIAGONAL', false);

  const state = new GameState(1, 1);
  state.g = 12;
  _.each(state.neighbors(traversabilityCells), n => {
    t.is(n.g, 13);
  });
  PathRewireAPI.__ResetDependency__('DIAGONAL');
  t.end();
});


test('test getShortestPath returns shortest path without diagonals', t => {
  PathRewireAPI.__Rewire__('DIAGONAL', false);
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
  );
  t.equal(shortestPath.length, 14);
  PathRewireAPI.__ResetDependency__('DIAGONAL');

  t.end();
});


test('getShortestPath()', tester => {
  tester.test('returns shortest path with diagonals', t => {
    PathRewireAPI.__Rewire__('DIAGONAL', true);
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
    );
    t.equal(shortestDiagonalPath.length, 10);
    PathRewireAPI.__ResetDependency__('DIAGONAL');

    t.end();
  });


  tester.test('returns undefined when no path exists', t => {
    PathRewireAPI.__Rewire__('DIAGONAL', true);
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
    );
    t.false(impossiblePath);

    PathRewireAPI.__ResetDependency__('DIAGONAL');
    t.end();
  });


  tester.test('throws error when inputs are out of bounds', t => {
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
      );
    });
    t.throws(() => {
      getShortestPath(
        { xc: 2, yc: 3 },
        { xc: 3, yc: 8 },
        impossibleMap,
      );
    });

    t.end();
  });


  tester.test('returns the shortest path when the greedy algorithm returns the wrong path', t => {
    PathRewireAPI.__Rewire__('DIAGONAL', false);
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
      { xc: 0, yc: 2 },
      { xc: 8, yc: 28 },
      map,
    );
    t.is(shortestDiagonalPath.length, 62);
    PathRewireAPI.__ResetDependency__('DIAGONAL');

    t.end();
  });
  tester.end();
});
