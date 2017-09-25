import test from 'tape';
import { getNTKernel, __RewireAPI__ as ConstantsRewireAPI } from '../../src/helpers/constants';


test('getNTKernel', tester => {
  tester.test('returns correct kernel with PPCL=40', t => {
    ConstantsRewireAPI.__Rewire__('PPCL', 40);
    ConstantsRewireAPI.__Rewire__('BRP', 19);

    t.same(getNTKernel(), [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ]);

    ConstantsRewireAPI.__ResetDependency__('PPCL');
    ConstantsRewireAPI.__ResetDependency__('BRP');
    t.end();
  });


  tester.test('returns correct kernel with PPCL=20', t => {
    ConstantsRewireAPI.__Rewire__('PPCL', 20);
    ConstantsRewireAPI.__Rewire__('BRP', 19);

    t.same(getNTKernel(), [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ]);

    ConstantsRewireAPI.__ResetDependency__('PPCL');
    ConstantsRewireAPI.__ResetDependency__('BRP');
    t.end();
  });


  tester.test('returns correct kernel with PPCL=10', t => {
    ConstantsRewireAPI.__Rewire__('PPCL', 10);
    ConstantsRewireAPI.__Rewire__('BRP', 19);

    t.same(getNTKernel(), [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ]);

    ConstantsRewireAPI.__ResetDependency__('PPCL');
    ConstantsRewireAPI.__ResetDependency__('BRP');
    t.end();
  });


  tester.test('returns correct kernel with PPCL=5', t => {
    ConstantsRewireAPI.__Rewire__('PPCL', 5);
    ConstantsRewireAPI.__Rewire__('BRP', 19);

    t.same(getNTKernel(), [
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
    ]);

    ConstantsRewireAPI.__ResetDependency__('PPCL');
    ConstantsRewireAPI.__ResetDependency__('BRP');
    t.end();
  });

  tester.end();
});
