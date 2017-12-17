import test from 'tape';
import { isRoughly } from '../../src/utils/general';
import {
  getClearancePoint,
  __RewireAPI__ as GraphUtilsRewireAPI,
} from '../../src/utils/graphUtils';
import { Point } from '../../src/navmesh/graph';


test('getClearancePoint()', tester => {
  tester.test('works for top-left clearance', t => {
    GraphUtilsRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, -1);
    const nextPoint = new Point(-1, 0);

    const clearancePoint = getClearancePoint(cornerPoint, prevPoint, nextPoint);
    const expected = new Point(1, 1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    GraphUtilsRewireAPI.__ResetDependency__('CLEARANCE');
    t.end();
  });

  tester.test('works for top-right clearance', t => {
    GraphUtilsRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, -1);
    const nextPoint = new Point(1, 0);

    const clearancePoint = getClearancePoint(cornerPoint, prevPoint, nextPoint);
    const expected = new Point(-1, 1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    GraphUtilsRewireAPI.__ResetDependency__('CLEARANCE');
    t.end();
  });

  tester.test('works for bottom-left clearance', t => {
    GraphUtilsRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, 1);
    const nextPoint = new Point(1, 0);

    const clearancePoint = getClearancePoint(cornerPoint, prevPoint, nextPoint);
    const expected = new Point(-1, -1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    GraphUtilsRewireAPI.__ResetDependency__('CLEARANCE');
    t.end();
  });

  tester.test('works for bottom-right clearance', t => {
    GraphUtilsRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, 1);
    const nextPoint = new Point(-1, 0);

    const clearancePoint = getClearancePoint(cornerPoint, prevPoint, nextPoint);
    const expected = new Point(1, -1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    GraphUtilsRewireAPI.__ResetDependency__('CLEARANCE');
    t.end();
  });
});
