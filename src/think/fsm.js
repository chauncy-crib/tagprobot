import _ from 'lodash';

import { BRP } from '../global/constants';
import { ROLES } from '../look/constants';
import {
  getEnemyGoal,
  isCenterFlag,
  myTeamHasFlag,
  enemyTeamHasFlag,
} from '../look/gameState';
import {
  findAllyFlagStation,
  findEnemyFlagStation,
  findCenterFlagStation,
  findAllyEndzone,
} from '../look/tileLocations';
import {
  findEnemyFC,
  findEnemyRB,
  playerIsNearPoint,
  getEnemyPlayersNearAllyFlagStation,
  getPlayerClosestToPoint,
} from '../look/playerLocations';
import { getPGP } from '../plan/pgp';
import { getMyRole } from '../look/playerRoles';
import { Point } from '../interpret/class/Point';
import { getDTGraph } from '../interpret/setup';
import { getShortestPolypointPath } from '../plan/astar';
import { funnelPolypoints } from '../plan/funnel';


/**
 * @param {{point: {x: number, y: number}}[]} path - a list of objects with a point key.
 * @param {number} granularity - the euclidian distance the points along the path should be
 *   separated by.
 * @returns {{x: number, y: number}[]} a list of points along the path. These points result from
 *   connecting each point in the input path, then placing points along each line, separated by
 *   granularity
 */
function getPointsAlongPath(path, granularity = 40) {
  const res = [];
  for (let i = 0; i < path.length - 1; i += 1) {
    const currPoint = path[i].point;
    const nextPoint = path[i + 1].point;
    const edgeLength = currPoint.distance(nextPoint);
    const increments = Math.floor(edgeLength / granularity);
    const xIncr = (nextPoint.x - currPoint.x) / increments;
    const yIncr = (nextPoint.y - currPoint.y) / increments;
    res.push(currPoint);
    for (let j = 0; j < increments - 1; j += 1) {
      const prev = _.last(res);
      res.push({ x: prev.x + xIncr, y: prev.y + yIncr });
    }
  }
  res.push(_.last(path));
  return res;
}


function chaseEnemy(me, enemy) {
  // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
  const enemyShortestPath = [];
  _.forEach(
    funnelPolypoints(getShortestPolypointPath(
      { xp: enemy.x + BRP, yp: enemy.y + BRP },
      getEnemyGoal(),
      getDTGraph(),
    ), getDTGraph()),
    polypoint => enemyShortestPath.push(polypoint),
  );

  // Set goal as the interception point
  const interceptionPolypoint = _.find(getPointsAlongPath(enemyShortestPath), polypoint => {
    const pp = new Point(polypoint.x, polypoint.y);
    const myDist = pp.distance(new Point(me.x + BRP, me.y + BRP));
    const enemyDist = pp.distance(new Point(enemy.x + BRP, enemy.y + BRP));
    return myDist < enemyDist;
  });
  const goal = interceptionPolypoint ?
    { xp: interceptionPolypoint.x, yp: interceptionPolypoint.y } :
    { xp: enemy.x + enemy.vx, yp: enemy.y + enemy.vy };
  return { goal, enemyShortestPath };
}

/**
 * @param { Object } me
 * @returns {{goal: {xp: number, yp: number}, enemyShortestPath: PolyPoint[]}} goal, our global
 *   destination in pixels and enemyShortestPath, the polypoints that we predict our enemy to
 *   follow
 */
function centerFlagFSM(me) {
  // If the bot has the flag, go to the endzone
  if (me.flag) {
    const goal = findAllyEndzone();
    const enemyShortestPath = [];
    console.info('I have the flag. Seeking endzone!');
    return { goal, enemyShortestPath };
  }
  // If we see an enemy player with the flag, chase
  const enemyFC = findEnemyFC();
  if (enemyFC) {
    const { goal, enemyShortestPath } = chaseEnemy(me, enemyFC);
    console.info('I see an enemy with the flag. Chasing!');
    return { goal, enemyShortestPath };
  }
  // If the enemy team has the flag and we don't see them, go to center flag station
  if (enemyTeamHasFlag()) {
    const goal = findCenterFlagStation();
    const enemyShortestPath = [];
    console.info('Enemy has the flag. Headed towards the center flag station');
    return { goal, enemyShortestPath };
  }
  // If my team has the flag, go to our endzone
  if (myTeamHasFlag()) {
    const goal = findAllyEndzone();
    const enemyShortestPath = [];
    console.info('We have the flag. Headed towards our Endzone.');
    return { goal, enemyShortestPath };
  }
  // Go to the center flag station in hopes of grabbing the flag
  const goal = findCenterFlagStation();
  const enemyShortestPath = [];
  console.info('Nobody has the flag. Going to center flag station!');
  return { goal, enemyShortestPath };
}


/**
 * @param { Object } me
 * @returns {{goal: {xp: number, yp: number}, enemyShortestPath: PolyPoint[]}} goal, our global
 *   destination in pixels and enemyShortestPath, the polypoints that we predict our enemy to
 *   follow
 */
function twoFlagFSM(me) {
  const myRole = getMyRole();
  if (myRole === ROLES.OFFENSE) {
    // If I have the flag, then go back to my flag station in hopes of scoring
    if (me.flag) {
      const goal = findAllyFlagStation();
      const enemyShortestPath = [];
      console.info('I have the flag. Seeking ally flag station!');
      return { goal, enemyShortestPath };
    }
    // If an enemy player in view has the flag, chase them in hopes of tagging
    const enemyFC = findEnemyFC();
    if (enemyFC) {
      const { goal, enemyShortestPath } = chaseEnemy(me, enemyFC);
      console.info('I see an enemy with the flag. Chasing!');
      return { goal, enemyShortestPath };
    }
    // Go to the enemy flag station in hopes of spotting the enemy FC
    const goal = findEnemyFlagStation();
    const enemyShortestPath = [];
    console.info('I do not know what to do. Going to enemy base!');
    return { goal, enemyShortestPath };
  }
  if (myRole === ROLES.DEFENSE) {
    // If we see the enemy flag carrier, chase them
    const enemyFC = findEnemyFC();
    if (enemyFC) {
      const { goal, enemyShortestPath } = chaseEnemy(me, enemyFC);
      console.info('I see an enemy with the flag. Chasing!');
      return { goal, enemyShortestPath };
    }
    // If the enemy team has the flag and we can't see them, go to enemy flag station
    if (enemyTeamHasFlag()) {
      const goal = findEnemyFlagStation();
      const enemyShortestPath = [];
      console.info('Enemy has the flag. Headed towards the center flag station!');
      return { goal, enemyShortestPath };
    }
    // If we are not in our base, go to the ally flag station
    const base = findAllyFlagStation();
    if (!playerIsNearPoint(me, new Point(base.xp, base.yp))) {
      const goal = base;
      const enemyShortestPath = [];
      console.info('I am too far from my flag station. Headed to ally flag station!');
      return { goal, enemyShortestPath };
    }
    // If we see an enemy with rolling bomb, chase them
    const enemyRB = findEnemyRB();
    if (enemyRB) {
      const { goal, enemyShortestPath } = chaseEnemy(me, enemyRB);
      console.info('I see an enemy with rolling bomb. Chasing!');
      return { goal, enemyShortestPath };
    }
    // If we see at least one enemy near our flag station, assume the post-grab pop position
    const enemiesNearAllyFlagStation = getEnemyPlayersNearAllyFlagStation();
    if (enemiesNearAllyFlagStation.length > 0) {
      const enemyClosestToAllyFlagStation = getPlayerClosestToPoint(
        enemiesNearAllyFlagStation,
        new Point(base.x, base.y),
      );
      const goal = getPGP(enemyClosestToAllyFlagStation);
      const enemyShortestPath = [];
      console.info('I see an enemy near my flag station. Assuming PGP position!');
      return { goal, enemyShortestPath };
    }
    const goal = findAllyFlagStation();
    const enemyShortestPath = [];
    console.info('I do not know what to do. Going to ally flag station!');
    return { goal, enemyShortestPath };
  }
  const goal = findAllyFlagStation();
  const enemyShortestPath = [];
  console.info('My role is not defined. Going to ally flag station!');
  return { goal, enemyShortestPath };
}


/**
 * @param { Object } me
 * @returns {{goal: {xp: number, yp: number}, enemyShortestPath: PolyPoint[]}} goal, our global
 *   destination in pixels and enemyShortestPath, the polypoints that we predict our enemy to
 *   follow
 */
export function FSM(me) {
  return isCenterFlag() ? centerFlagFSM(me) : twoFlagFSM(me);
}
