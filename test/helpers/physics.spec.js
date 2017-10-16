import test from 'tape';
import { projectedState } from '../../src/helpers/physics';
import { maxSpeed, PPTL } from '../../src/constants';

test('projectedState: applies drag properly', t => {
  const nextState = projectedState(0, 0, 8, -4, {}, 0.5);
  t.equal(nextState.vxp, 6);
  t.equal(nextState.vyp, -3);
  t.end();
});

test('projectedState: returns correct state with no keypress', t => {
  t.same(projectedState(15, 17, 0, 0, {}, 0.5), { xp: 15, yp: 17, vxp: 0, vyp: 0 });
  t.same(projectedState(15, 17, 3, -8, {}, 0.5), { xp: 16.3125, yp: 13.5, vxp: 2.25, vyp: -6 });
  t.end();
});

test('projectedState: returns correct state with keypresses', t => {
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

test('projectedState: applies cieling to velocity', t => {
  let state = projectedState(0, 0, 245, -245, { x: 'RIGHT', y: 'UP' }, 0.5);
  t.is(state.vxp, 250);
  t.is(state.vyp, -250);
  state = projectedState(0, 0, -245, 245, { x: 'LEFT', y: 'DOWN' }, 0.5);
  t.is(state.vxp, -250);
  t.is(state.vyp, 250);
  t.end();
});


test('projectedState: takes correct amount of time/distance to reach max speed.', t => {
  const step = 0.001;
  const maxSpeedPixels = maxSpeed;
  let time = 0;
  let position = 0;
  let speed = 0;
  while (speed < maxSpeedPixels) {
    const nextState = projectedState(position, 0, speed, 0, { x: 'RIGHT' }, step);
    position = nextState.xp;
    speed = nextState.vxp;
    time += step;
  }
  t.true(Math.abs(time - 3.57) < 0.1); // from empiracle tests, time to max speed is 3.57 seconds
  t.true(Math.abs(position - 574) < 10); // also based on tests
  t.end();
});

