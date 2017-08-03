import test from 'tape';
import { assert, assertGridInBounds } from '../src/utils/asserts';

test('test assert', t => {
  let condition = false;
  t.throws(() => { assert(condition); });

  condition = true;
  t.doesNotThrow(() => { assert(condition); });

  t.end();
});

test('test assertGridInBounds', t => {
  const arr = [[0, 0, 0], [0, 0, 0]]; // a 2x3 array
  t.throws(() => { assertGridInBounds(arr, -1, 0); });
  t.throws(() => { assertGridInBounds(arr, 2, 0); });
  t.throws(() => { assertGridInBounds(arr, 1, -1); });
  t.throws(() => { assertGridInBounds(arr, 1, 4); });
  t.doesNotThrow(() => { assertGridInBounds(arr, 1, 1); });

  t.end();
});