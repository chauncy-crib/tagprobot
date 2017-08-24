import test from 'tape';
import { multiplyCorrespondingElementsAndSum,
  getSubarrayFrom2dArray,
  addBufferTo2dArray,
  convolve } from '../src/helpers/convolve';


test('addBufferTo2dArray: correctly adds buffer to grid', t => {
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  const bufSize = 2;
  const bufVal = 1;
  t.same(addBufferTo2dArray(matrix, bufSize, bufVal), [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 3, 1, 1],
    [1, 1, 4, 5, 6, 1, 1],
    [1, 1, 7, 8, 9, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ]);

  t.end();
});


test('getSubarrayFrom2dArray: returns the correct subarray for varying inputs', t => {
  let array = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 0, 1, 2],
    [3, 4, 5, 6],
  ];
  let xCenter = 2;
  let yCenter = 2;
  let width = 3;
  let height = 3;
  t.same(getSubarrayFrom2dArray(array, xCenter, yCenter, width, height), [
    [6, 7, 8],
    [0, 1, 2],
    [4, 5, 6],
  ]);

  array = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 0, 1, 2],
    [3, 4, 5, 6, 7, 8],
    [9, 0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 0],
  ];
  xCenter = 2;
  yCenter = 1;
  width = 5;
  height = 3;
  t.same(getSubarrayFrom2dArray(array, xCenter, yCenter, width, height), [
    [1, 2, 3],
    [7, 8, 9],
    [3, 4, 5],
    [9, 0, 1],
    [5, 6, 7],
  ]);

  t.end();
});


test('multiplyCorrespondingElementsAndSum: returns correctly with inputs that are same size', t => {
  const m1 = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  const m2 = [
    [9, 8, 7],
    [6, 5, 4],
    [3, 2, 1],
  ];
  t.is(multiplyCorrespondingElementsAndSum(m1, m2), 165);

  t.end();
});


test('convolve: returns correctly with kernel size 1x1', t => {
  let m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  let k = [
    [1],
  ];
  t.same(convolve(m, k), [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);

  m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  k = [
    [2],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  t.same(convolve(m, k), [
    [2, 4, 6],
    [8, 10, 12],
    [14, 16, 18],
  ]);

  t.end();
});


test('convolve: returns correctly with kernel size 3x3', t => {
  const m = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 0, 1, 2],
  ];
  const k = [
    [1, 2, 3],
    [3, 4, 5],
    [6, 7, 8],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  t.same(convolve(m, k), [
    [112, 160, 193, 142],
    [131, 150, 129, 100],
    [89, 91, 79, 63],
  ]);

  t.end();
});
