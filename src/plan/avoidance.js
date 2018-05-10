import _ from 'lodash';
import { playerIsOnMyTeam, getMe } from '../look/gameState';
import { getPlayerCenter } from '../look/playerLocations';

/**
 * @param {Polypoint} p
 * @returns {number} the enemy-avoidance cost of that point. The closer we are the the point, and
 *   the closer an enemy is to the point, the higher the cost.
 */
export function enemyAvoidanceCost(p) {
  const k = 100000;
  const e = 0.06;
  const m = 0.1;
  const myLocation = getPlayerCenter(getMe());
  const distFromMe = p.t.distToPoint(myLocation);
  return _.sumBy(_.reject(tagpro.players, player => playerIsOnMyTeam(player)), enemy => {
    if (!_.has(enemy, 'x')) return 0;
    const enemyLocation = getPlayerCenter(enemy);
    const enemyDist = p.t.distToPoint(enemyLocation);
    return k / ((1 + ((e * enemyDist) ** 2)) * (1 + (m * distFromMe)));
  });
}
