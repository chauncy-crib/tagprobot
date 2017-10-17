import test from 'tape';
import {
  projectedState,
  binarySearchAcceleration,
  desiredAcceleration } from '../../src/helpers/physics';
import { maxSpeed } from '../../src/constants';

test('projectedState', tester => {
  tester.test('applies drag properly', t => {
    const nextState = projectedState(0, 0, 8, -4, {}, 0.5);
    t.equal(nextState.vxp, 6);
    t.equal(nextState.vyp, -3);
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

  tester.test('applies cieling to velocity', t => {
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
    while (speed < maxSpeed) {
      const nextState = projectedState(position, 0, speed, 0, { x: 'RIGHT' }, step);
      position = nextState.xp;
      speed = nextState.vxp;
      time += step;
    }
    t.true(Math.abs(time - 3.57) < 0.1); // from empiracle tests, time to max speed is 3.57 seconds
    t.true(Math.abs(position - 574) < 10); // also based on tests
    t.end();
  });

  tester.end();
});


test('binarySearchAcceleration', tester => {
  tester.test('returns accurate keypress frequency', t => {
    t.true(Math.abs(binarySearchAcceleration(0, 0, 75, 3) - 0.17) < 0.01);
    t.true(Math.abs(binarySearchAcceleration(-75, 0, 0, 3) - 0.17) < 0.01);
    t.true(Math.abs(binarySearchAcceleration(-75, -30, 10, 3) - 0.30) < 0.01);
    t.true(Math.abs(binarySearchAcceleration(-75, -30, 40, 3) - 0.37) < 0.01);
    t.true(Math.abs(binarySearchAcceleration(-75, 200, 40, 3) + 0.45) < 0.01);
    t.end();
  });

  tester.test('supported by physics calculations', t => {
    const step = 0.001;
    let time = 0;
    let position = -75;
    let speed = -30;
    const accMult = binarySearchAcceleration(-75, -30, 40, 3);
    while (time < 3) {
      const nextState = projectedState(position, 0, speed, 0, { x: 'RIGHT' }, step, accMult);
      position = nextState.xp;
      speed = nextState.vxp;
      time += step;
    }
    t.true(Math.abs(position - 40) < 1);
    t.end();
  });

  tester.end();
});


test('desiredAcceleration', tester => {
  tester.test('when target is down and right', t => {
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, 100, 100).accX - 1) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, 100, 100).accY - 1) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, -100, 100).accX + 1) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, -100, 100).accY - 1) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, -100, -100).accX + 1) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, -100, -100).accY + 1) < 0.01);
    t.end();
  });

  tester.test('when target is further down than right', t => {
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, 100, 300).accX - 0.33) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, 100, 300).accY - 1) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 0, 100, 600).accX - 0.17) < 0.01);
    t.end();
  });

  tester.test('with initial velocities', t => {
    t.true(Math.abs(desiredAcceleration(0, 0, 0, 50, 300, 300).accY - 0.76) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, -200, 50, 300, 300).accY - 0.33) < 0.01);
    t.true(Math.abs(desiredAcceleration(0, 0, 0, -200, 300, 600).accX - 0.31) < 0.01);
    // t.is(desiredAcceleration(0, 0, 0, -200, 300, 600), {})
    t.end();
  });

  tester.test('with target in multiple directions', t => {
    t.is(
      desiredAcceleration(0, 0, 0, -200, 300, 600).accX,
      -desiredAcceleration(0, 0, 0, -200, -300, 600).accX,
    );
    t.is(
      desiredAcceleration(200, 100, 50, 25, -10, -60).accX,
      -desiredAcceleration(-220, -220, -50, -25, -10, -60).accX,
    );
    t.is(
      desiredAcceleration(200, 100, 50, 25, -10, -60).accY,
      -desiredAcceleration(-220, -220, -50, -25, -10, -60).accY,
    );
    t.end();
  });


  tester.end();
});
