import test from 'tape';
import sinon from 'sinon';
import _ from 'lodash';

import { getLQRAccelerationMultipliers, dlqr, __RewireAPI__ as RewireAPI } from '../lqr';
import { isRoughly } from '../../global/utils';


test('getLQRAccelerationMultipliers', tester => {
  tester.test('works the same as python simulation for the first time step', t => {
    RewireAPI.__Rewire__('currentGoalState', null);
    RewireAPI.__Rewire__('currentKs', null);
    RewireAPI.__Rewire__('currentTime', null);
    RewireAPI.__Rewire__('determineDeadline', () => 300);
    const x0 = { x: 0, vx: 0, y: 0, vy: -100 };
    const goal = { x: 100, vx: -50, y: 50, vy: -25 };

    const multipliers = getLQRAccelerationMultipliers(x0, goal);
    t.true(isRoughly(multipliers.accX, 0.28));
    t.true(isRoughly(multipliers.accY, 0.44));

    RewireAPI.__ResetDependency__('currentGoalState');
    RewireAPI.__ResetDependency__('currentKs');
    RewireAPI.__ResetDependency__('currentTime');
    RewireAPI.__ResetDependency__('determineDeadline');
    t.end();
  });

  tester.test('calls dlqr again if goal state changes', t => {
    const dlqrSpy = sinon.stub().callsFake(dlqr);
    RewireAPI.__Rewire__('currentGoalState', null);
    RewireAPI.__Rewire__('currentKs', null);
    RewireAPI.__Rewire__('currentTime', null);
    RewireAPI.__Rewire__('dlqr', dlqrSpy);
    RewireAPI.__Rewire__('determineDeadline', () => 60);
    const x0 = { x: 0, vx: 0, y: 0, vy: -100 };
    const goal = { x: 100, vx: -50, y: 50, vy: -25 };
    const newGoal = { x: 200, vx: -50, y: 50, vy: -25 };

    _.times(2, () => getLQRAccelerationMultipliers(x0, goal));
    t.is(dlqrSpy.callCount, 1);
    _.times(2, () => getLQRAccelerationMultipliers(x0, newGoal));
    t.is(dlqrSpy.callCount, 2);

    RewireAPI.__ResetDependency__('currentGoalState');
    RewireAPI.__ResetDependency__('currentKs');
    RewireAPI.__ResetDependency__('currentTime');
    RewireAPI.__ResetDependency__('dlqr');
    RewireAPI.__ResetDependency__('determineDeadline');
    t.end();
  });
});
