import test from 'tape';
import { assert, assertArrayInBounds } from '../src/utils/asserts';


test('test assert', t => {
  let condition = false;
  t.throws(() => { assert(condition); });

  condition = true;
  t.doesNotThrow(() => { assert(condition); });

  t.end();
});


test('test assertArrayInBounds', t => {
  const arr = [[0, 0, 0], [0, 0, 0]]; // a 2x3 array
  t.throws(() => { assertArrayInBounds(arr, -1, 0); });
  t.throws(() => { assertArrayInBounds(arr, 2, 0); });
  t.throws(() => { assertArrayInBounds(arr, 1, -1); });
  t.throws(() => { assertArrayInBounds(arr, 1, 4); });
  t.doesNotThrow(() => { assertArrayInBounds(arr, 1, 1); });

  t.end();
});
