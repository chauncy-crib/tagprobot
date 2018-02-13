import test from 'tape';

import { determinant } from '../../global/determinant';

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
