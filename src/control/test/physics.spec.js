import test from 'tape';

import {
  projectedState,
  binarySearchAcceleration,
  desiredAccelerationMultiplier } from '../physics';
import { isRoughly } from '../../utils/general';
import { MAX_SPEED } from '../../constants';


test('projectedState', tester => {
  tester.test('applies drag properly', t => {
    const nextState = projectedState(0, 0, 8, -4, {}, 0.5);
    t.equals(nextState.vxp, 6);
    t.equals(nextState.vyp, -3);

    t.end();
  });

  tester.test('returns correct state with no keypress', t => {
    t.same(projectedState(15, 17, 0, 0, {}, 0.5), { xp: 15, yp: 17, vxp: 0, vyp: 0 });
    t.same(projectedState(15, 17, 3, -8, {}, 0.5), { xp: 16.3125, yp: 13.5, vxp: 2.25, vyp: -6 });

    t.end();
  });

  tester.test('returns correct state with keypresses', t => {
    t.same(
      projectedState(15, 17, 0, 0, { x: 'RIGHT', y: 'UP' }, 0.5),
      { xp: 33.75, yp: -1.75, vxp: 75, vyp: -75 },
    );
    t.same(
      projectedState(15, 17, -50, 80, { x: 'RIGHT', y: 'DOWN' }, 0.5),
      { xp: 11.875, yp: 70.75, vxp: 37.5, vyp: 135 },
    );
    t.same(
      projectedState(15, 17, -50, 80, { x: 'LEFT', y: 'DOWN' }, 0.5),
      { xp: -25.625, yp: 70.75, vxp: -112.5, vyp: 135 },
    );

    t.end();
  });

  tester.test('applies ceiling to velocity', t => {
    let state = projectedState(0, 0, 245, -245, { x: 'RIGHT', y: 'UP' }, 0.5);
    t.is(state.vxp, 250);
    t.is(state.vyp, -250);

    state = projectedState(0, 0, -245, 245, { x: 'LEFT', y: 'DOWN' }, 0.5);
    t.is(state.vxp, -250);
    t.is(state.vyp, 250);

    t.end();
  });

  tester.test('takes correct amount of time/distance to reach max speed.', t => {
    const step = 0.001;
    let time = 0;
    let position = 0;
    let speed = 0;
    while (speed < MAX_SPEED) {
      const nextState = projectedState(position, 0, speed, 0, { x: 'RIGHT' }, step);
      position = nextState.xp;
      speed = nextState.vxp;
      time += step;
    }
    t.true(isRoughly(time, 3.57, 0.1)); // from empirical tests, time to max speed is 3.57 seconds
    t.true(isRoughly(position, 574, 10)); // also based on tests

    t.end();
  });

  tester.end();
});


test('binarySearchAcceleration', tester => {
  tester.test('returns accurate keypress frequency', t => {
    // Relative distances are the same
    const smallAcc1 = binarySearchAcceleration(0, 0, 75, 3);
    const smallAcc2 = binarySearchAcceleration(-75, 0, 0, 3);
    t.equals(smallAcc1, smallAcc2);
    t.true(smallAcc1 < 0.5);
    t.true(smallAcc1 > 0);

    const medAcc1 = binarySearchAcceleration(-75, -30, 10, 3);
    const medAcc2 = binarySearchAcceleration(-75, -30, 40, 3);
    const medAcc3 = binarySearchAcceleration(-75, 200, 40, 3);
    t.true(medAcc1 > smallAcc1);
    t.true(medAcc2 > medAcc1);
    t.true(-medAcc3 > medAcc2);
    t.true(medAcc2 < 1);
    t.true(medAcc3 > -1);

    t.end();
  });

  tester.test('is supported by physics calculations', t => {
    const step = 0.001;
    let time = 0;
    let position = -75;
    let speed = -30;
    // Acceleration returned by the binary search should bring the ball to a position of 40
    const accMult = binarySearchAcceleration(-75, -30, 40, 3);
    while (time < 3) {
      const nextState = projectedState(position, 0, speed, 0, { x: 'RIGHT' }, step, accMult);
      position = nextState.xp;
      speed = nextState.vxp;
      time += step;
    }
    // Acceptable margin of error is 2 pixels
    t.true(isRoughly(position, 40, 2));

    t.end();
  });

  tester.end();
});


test('desiredAccelerationMultiplier', tester => {
  tester.test('returns reasonable values when target is 45 degrees off an axis', t => {
    const downRight = desiredAccelerationMultiplier(0, 0, 0, 0, 100, 100);
    t.true(isRoughly(downRight.accX, 1));
    t.true(isRoughly(downRight.accY, 1));
    const downLeft = desiredAccelerationMultiplier(0, 0, 0, 0, -100, 100);
    t.true(isRoughly(downLeft.accX, -1));
    t.true(isRoughly(downLeft.accY, 1));
    const upLeft = desiredAccelerationMultiplier(0, 0, 0, 0, -100, -100);
    t.true(isRoughly(upLeft.accX, -1));
    t.true(isRoughly(upLeft.accY, -1));

    t.end();
  });

  tester.test('returns reasonable values when target is further down than right', t => {
    const holdDown = desiredAccelerationMultiplier(0, 0, 0, 0, 100, 300);
    const holdDownMore = desiredAccelerationMultiplier(0, 0, 0, 0, 100, 600);
    t.is(holdDown.accY, 1);
    t.is(holdDownMore.accY, 1);
    t.true(holdDown.accX > 0 && holdDown.accX < 0.5);
    t.true(holdDownMore.accX > 0 && holdDownMore.accX < holdDown.accX && holdDownMore.accX < 0.25);

    t.end();
  });

  tester.test('returns reasonable values with initial velocities', t => {
    const initialDownVelocity = desiredAccelerationMultiplier(0, 0, 0, 50, 300, 300);
    const initialLeftDownVelocity = desiredAccelerationMultiplier(0, 0, -200, 50, 300, 300);
    const initialUpVelocity = desiredAccelerationMultiplier(0, 0, 0, -200, 300, 600);
    t.true(initialDownVelocity.accY > 0.5 && initialDownVelocity.accY < 1);
    t.is(initialDownVelocity.accX, 1);
    t.true(initialLeftDownVelocity.accY < 0.5 && initialLeftDownVelocity.accY > 0);
    t.is(initialLeftDownVelocity.accX, 1);
    t.true(initialUpVelocity.accX < 0.5 && initialUpVelocity.accX > 0);
    t.is(initialUpVelocity.accY, 1);

    t.end();
  });

  tester.test('returns reasonable values with target in multiple directions', t => {
    t.is(
      desiredAccelerationMultiplier(0, 0, 0, -200, 300, 600).accX,
      -desiredAccelerationMultiplier(0, 0, 0, -200, -300, 600).accX,
    );
    t.is(
      desiredAccelerationMultiplier(200, 100, 50, 25, -10, -60).accX,
      -desiredAccelerationMultiplier(-220, -220, -50, -25, -10, -60).accX,
    );
    t.is(
      desiredAccelerationMultiplier(200, 100, 50, 25, -10, -60).accY,
      -desiredAccelerationMultiplier(-220, -220, -50, -25, -10, -60).accY,
    );

    t.end();
  });

  tester.end();
});
