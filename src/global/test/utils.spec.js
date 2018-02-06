import test from 'tape';

import { assert, assertGridInBounds } from '../utils';


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
