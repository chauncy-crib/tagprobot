import { findAllyFlagStation } from '../look/tileLocations';
import { getDesiredAccelerationMultipliers, runSimulation } from '../control/physics';
import { Point } from '../interpret/class/Point';
import { getPlayerCenter } from '../look/playerLocations';

/**
 * @param {Object} player - a player from the tagpro api. The enemy we are using to calculate the
 *   PGP position.
 * @param {number} [bumperTime=0.25] - the time, in seconds, the enemy is invincible after they grab
 *   the flag
 * @returns {Point} - the PGP position
 */
export function getPGPPosition(player, bumperTime = 0.25) {
  const { xp, yp } = findAllyFlagStation();
  const playerCenter = getPlayerCenter(player);
  const { accX, accY, time } = getDesiredAccelerationMultipliers(
    playerCenter.x,
    playerCenter.y,
    player.vx,
    player.vy,
    xp,
    yp,
  );

  const keypress = { x: accX > 0 ? 'RIGHT' : 'LEFT', y: accY > 0 ? 'DOWN' : 'UP' };
  const sim = runSimulation(
    playerCenter.x,
    playerCenter.y,
    player.vx,
    player.vy,
    keypress,
    Math.abs(accX),
    Math.abs(accY),
    time + bumperTime,
  );
  return new Point(sim.xp, sim.yp);
}
