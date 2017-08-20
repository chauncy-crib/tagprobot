import test from 'tape';
import _ from 'lodash';

import { GameState, shortestPath, __RewireAPI__ as AStarRewireAPI } from '../src/helpers/astar';

test('test shortestPath', t => {
  const inputMap = [
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const path = shortestPath(
    { xc: 0, yc: 0 },
    { xc: 0, yc: 2 },
    inputMap,
    true,
  );

  t.end();
});

test('test neighbors returns the right number of neighbors with diagonals on', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  AStarRewireAPI.__Rewire__('diagonal', true);

  let state = new GameState(1, 1);
  t.is(state.neighbors(traversabilityCells).length, 5);

  state = new GameState(1, 0);
  t.is(state.neighbors(traversabilityCells).length, 3);

  state = new GameState(0, 2);
  t.is(state.neighbors(traversabilityCells).length, 1);

  state = new GameState(2, 2);
  t.is(state.neighbors(traversabilityCells).length, 2);

  AStarRewireAPI.__ResetDependency__('diagonal');
  t.end();
});


test('test neighbors returns the right number of neighbors with diagonals off', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  AStarRewireAPI.__Rewire__('diagonal', false);

  let state = new GameState(1, 1);
  t.is(state.neighbors(traversabilityCells).length, 2);

  state = new GameState(1, 0);
  t.is(state.neighbors(traversabilityCells).length, 2);

  state = new GameState(0, 2);
  t.is(state.neighbors(traversabilityCells).length, 0);

  state = new GameState(2, 2);
  t.is(state.neighbors(traversabilityCells).length, 1);

  AStarRewireAPI.__ResetDependency__('diagonal');
  t.end();
});

test('test neighbors have correct g values', t => {
  const traversabilityCells = [
    [1, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  AStarRewireAPI.__Rewire__('diagonal', false);

  const state = new GameState(1, 1);
  state.g = 12;
  _.each(state.neighbors(traversabilityCells), n => {
    t.is(n.g, 13);
  })
  AStarRewireAPI.__ResetDependency__('diagonal');
  t.end();
});
