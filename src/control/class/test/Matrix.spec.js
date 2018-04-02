import test from 'tape';

import { Matrix } from '../Matrix';


test('Matrix.dot()', tester => {
  tester.test('works for 2D arrays', t => {
    const a = new Matrix([[1, 0], [0, 1]]);
    const b = new Matrix([[4, 1], [2, 2]]);

    t.same(a.dot(b), [[4, 1], [2, 2]]);

    t.end();
  });

  tester.test('works for 1D arrays', t => {
    const a = new Matrix([2, 3]);
    const b = new Matrix([2, 3]);

    t.same(a.dot(b), 13);

    t.end();
  });
});

test('Matrix.add()', tester => {
  tester.test('works for 2D arrays', t => {
    const a = new Matrix([[1, 2], [3, 4]]);
    const b = new Matrix([[1, 2], [3, 4]]);

    t.same(a.add(b), [[2, 4], [6, 8]]);

    t.end();
  });
});

test('Matrix.subtract()', tester => {
  tester.test('works for 2D arrays', t => {
    const a = new Matrix([[2, 4], [6, 8]]);
    const b = new Matrix([[1, 2], [3, 4]]);

    t.same(a.subtract(b), [[1, 2], [3, 4]]);

    t.end();
  });
});

test('Matrix.inverse()', tester => {
  tester.test('works for 2D arrays', t => {
    const a = new Matrix([[4, 7], [2, 6]]);

    t.same(a.inverse(), [[0.6, -0.7], [-0.2, 0.4]]);

    t.end();
  });
});
