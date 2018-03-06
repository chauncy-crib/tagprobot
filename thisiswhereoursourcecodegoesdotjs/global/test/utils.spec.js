import test from 'tape';

import { assert, assertGridInBounds, determinant } from '../utils';


test('assert: does not throw errors with condition=true', t => {
  const condition = true;
  t.doesNotThrow(() => { assert(condition); });

  t.end();
});


test('assert: throws errors with condition=false', t => {
  const condition = false;
  t.throws(() => { assert(condition); });

  t.end();
});


test('assertGridInBounds: does not throw errors when inputs are in bounds', t => {
  const arr = [[0, 0, 0], [0, 0, 0]]; // a 2x3 array
  t.doesNotThrow(() => { assertGridInBounds(arr, 1, 1); });

  t.end();
});


test('assertGridInBounds: throws errors when inputs are not in bounds', t => {
  const arr = [[0, 0, 0], [0, 0, 0]]; // a 2x3 array
  t.throws(() => { assertGridInBounds(arr, -1, 0); });
  t.throws(() => { assertGridInBounds(arr, 2, 0); });
  t.throws(() => { assertGridInBounds(arr, 1, -1); });
  t.throws(() => { assertGridInBounds(arr, 1, 4); });

  t.end();
});


test('determinant returns correct value for a 3x3', t => {
  t.is(determinant([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]), 0);
  t.is(determinant([
    [1, 3, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]), 6);
  t.is(determinant([
    [1, 3, 3],
    [4, 5, 6],
    [7, 4, 9],
  ]), -18);

  t.end();
});


test('determinant returns correct value for a 4x4', t => {
  t.is(determinant([
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
  ]), 0);
  t.is(determinant([
    [1, -2, 3, 4],
    [1, 5, 3, 7],
    [1, 2, 3, 4],
    [0, 2, 8, 4],
  ]), 96);
  t.is(determinant([
    [1, -2, 5, 4],
    [1, 5, 9, 7],
    [1, 2, 3, 4],
    [-1, 2, 8, 4],
  ]), -84);

  t.end();
});
