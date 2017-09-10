import test from 'tape';
import {
  multiplyCorrespondingElementsAndSum,
  getSubarrayFrom2dArray,
  addBufferTo2dArray,
  invertBinary2dArray,
  addNTBuffer,
  convolve,
} from '../../src/helpers/convolve';


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


test('getSubarrayFrom2dArray', tester => {
  tester.test('returns the correct subarray for 4x4 array', t => {
    const array = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 0, 1, 2],
      [3, 4, 5, 6],
    ];
    const xMin = 1;
    const yMin = 1;
    const xMax = 3;
    const yMax = 3;
    t.same(getSubarrayFrom2dArray(array, xMin, yMin, xMax, yMax), [
      [6, 7, 8],
      [0, 1, 2],
      [4, 5, 6],
    ]);

    t.end();
  });


  tester.test('returns the correct subarray for 6x5 array', t => {
    const array = [
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 0, 1, 2],
      [3, 4, 5, 6, 7, 8],
      [9, 0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9, 0],
    ];
    const xMin = 0;
    const yMin = 0;
    const xMax = 3;
    const yMax = 2;
    t.same(getSubarrayFrom2dArray(array, xMin, yMin, xMax, yMax), [
      [1, 2, 3],
      [7, 8, 9],
      [3, 4, 5],
      [9, 0, 1],
    ]);

    t.end();
  });

  tester.end();
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


test('invertBinary2dArray', tester => {
  tester.test('returns correctly with valid input', t => {
    const m = [
      [1, 1, 1],
      [1, 0, 1],
      [0, 1, 0],
      [0, 0, 0],
    ];
    t.same(invertBinary2dArray(m), [
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 1],
      [1, 1, 1],
    ]);

    t.end();
  });


  tester.test('throws errors with non-binary input', t => {
    t.throws(() => { invertBinary2dArray([[7]]); });
    t.throws(() => { invertBinary2dArray([[0.5]]); });
    t.throws(() => { invertBinary2dArray([['a']]); });

    t.end();
  });

  tester.end();
});


test('addNTBuffer', tester => {
  tester.test('returns correctly with large matrix', t => {
    const traversabilityGrid = [
      [1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ];
    const kernel = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    t.same(addNTBuffer(traversabilityGrid, kernel), [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ]);

    t.end();
  });

  tester.end();
});


test('convolve', tester => {
  tester.test('returns correctly with kernel size 1x1, k=[[1]]', t => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const k = [
      [1],
    ];
    t.same(convolve(m, k), [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);

    t.end();
  });


  tester.test('returns correctly with kernel size 1x1, k=[[2]]', t => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const k = [
      [2],
    ];
    t.same(convolve(m, k), [
      [2, 4, 6],
      [8, 10, 12],
      [14, 16, 18],
    ]);

    t.end();
  });


  tester.test('returns correctly with kernel size 3x3', t => {
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
    t.same(convolve(m, k), [
      [112, 160, 193, 142],
      [131, 150, 129, 100],
      [89, 91, 79, 63],
    ]);

    t.end();
  });

  tester.end();
});
