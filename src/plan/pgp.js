import { findAllyFlagStation } from '../look/tileLocations';
import { PPTL } from '../global/constants';
import { getDesiredAccelerationMultipliers, runSimulation } from '../control/physics';
import { Point } from '../interpret/class/Point';

export function getPGP(player, bumperTime = 0.25) {
  const allyFlag = findAllyFlagStation();
  const xpPlayer = player.x + (PPTL / 2);
  const ypPlayer = player.y + (PPTL / 2);
  const { accX, accY, time } = getDesiredAccelerationMultipliers(
    xpPlayer,
    ypPlayer,
    player.vx,
    player.vy,
    allyFlag.x,
    allyFlag.y,
  );

  const keypress = { x: accX > 0 ? 'RIGHT' : 'LEFT', y: accY > 0 ? 'DOWN' : 'UP' };
  const sim = runSimulation(
    xpPlayer,
    ypPlayer,
    player.vx,
    player.vy,
    keypress,
    Math.abs(accX),
    Math.abs(accY),
    time + bumperTime,
  );
  return new Point(sim.xp, sim.yp);
}
