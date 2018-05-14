import test from 'tape';

import { determineDeadline, recalculateKMatrices, getMultipliersFromKs } from '../lqr';
import { isRoughly } from '../../global/utils';


test('getLQRAccelerationMultipliers', tester => {
  tester.test('works the same as it has been for the first time step', t => {
    const x0 = { x: 0, vx: 0, y: 0, vy: -100 };
    const goal = { x: 100, vx: -50, y: 50, vy: -25 };

    const deadline = determineDeadline(x0, goal);
    const Ks = recalculateKMatrices(goal, deadline);
    const multipliers = getMultipliersFromKs(x0, goal, Ks, deadline);
    t.true(isRoughly(multipliers.accX, 1));
    t.true(isRoughly(multipliers.accY, 0.87));

    t.end();
  });
});
