import test from 'tape';
import sinon from 'sinon';
import _ from 'lodash';

import { getLQRAccelerationMultipliers, dlqr, __RewireAPI__ as RewireAPI } from '../lqr';
import { Matrix } from '../class/Matrix';
import { isRoughly } from '../../global/utils';


test('getLQRAccelerationMultipliers', tester => {
  tester.test('works the same as python simulation for the first time step', t => {
    RewireAPI.__Rewire__('currentGoalState', null);
    RewireAPI.__Rewire__('currentKs', null);
    RewireAPI.__Rewire__('currentTime', null);
    const x0 = new Matrix([[0], [0], [0], [-100]]);
    const goal = new Matrix([[100], [-50], [50], [-25]]);

    const multipliers = getLQRAccelerationMultipliers(x0, goal, 5);
    t.true(isRoughly(multipliers.accX, 0.28));
    t.true(isRoughly(multipliers.accY, 0.44));

    RewireAPI.__ResetDependency__('currentGoalState');
    RewireAPI.__ResetDependency__('currentKs');
    RewireAPI.__ResetDependency__('currentTime');
    t.end();
  });

  tester.test('calls dlqr again if timestep exceeds the total time', t => {
    const dlqrSpy = sinon.stub().callsFake(dlqr);
    RewireAPI.__Rewire__('currentGoalState', null);
    RewireAPI.__Rewire__('currentKs', null);
    RewireAPI.__Rewire__('currentTime', null);
    RewireAPI.__Rewire__('dlqr', dlqrSpy);
    const x0 = new Matrix([[0], [0], [0], [-100]]);
    const goal = new Matrix([[100], [-50], [50], [-25]]);

    _.times(4, () => getLQRAccelerationMultipliers(x0, goal, 0.1));
    t.is(dlqrSpy.callCount, 1);
    _.times(2, () => getLQRAccelerationMultipliers(x0, goal, 0.1));
    t.is(dlqrSpy.callCount, 2);

    RewireAPI.__ResetDependency__('currentGoalState');
    RewireAPI.__ResetDependency__('currentKs');
    RewireAPI.__ResetDependency__('currentTime');
    RewireAPI.__ResetDependency__('dlqr');
    t.end();
  });

  tester.test('calls dlqr again if goal state changes', t => {
    const dlqrSpy = sinon.stub().callsFake(dlqr);
    RewireAPI.__Rewire__('currentGoalState', null);
    RewireAPI.__Rewire__('currentKs', null);
    RewireAPI.__Rewire__('currentTime', null);
    RewireAPI.__Rewire__('dlqr', dlqrSpy);
    const x0 = new Matrix([[0], [0], [0], [-100]]);
    const goal = new Matrix([[100], [-50], [50], [-25]]);
    const newGoal = new Matrix([[200], [-50], [50], [-25]]);

    _.times(2, () => getLQRAccelerationMultipliers(x0, goal, 1));
    t.is(dlqrSpy.callCount, 1);
    _.times(2, () => getLQRAccelerationMultipliers(x0, newGoal, 1));
    t.is(dlqrSpy.callCount, 2);

    RewireAPI.__ResetDependency__('currentGoalState');
    RewireAPI.__ResetDependency__('currentKs');
    RewireAPI.__ResetDependency__('currentTime');
    RewireAPI.__ResetDependency__('dlqr');
    t.end();
  });
});
