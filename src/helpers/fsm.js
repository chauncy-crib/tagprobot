import _ from 'lodash';

// import { getDist } from '../utils/geometry';
import { PPCL, RED_ENDZONE, BLUE_ENDZONE } from '../constants';
import { getMapTraversabilityInCells } from './map';
import { amBlue } from './player';
import { getShortestCellPath } from './path';


// eslint-disable-next-line import/prefer-default-export
export function chaseEnemyFC(me, goal, enemyFC, enemyShortestPath) {
  const enemyGoal = amBlue() ? RED_ENDZONE : BLUE_ENDZONE;
  const enemyFinalTarget = {
    xc: Math.floor(enemyGoal.xp / PPCL),
    yc: Math.floor(enemyGoal.yp / PPCL),
  };
  enemyFC.xc = Math.floor((enemyFC.x + (PPCL / 2)) / PPCL);
  enemyFC.yc = Math.floor((enemyFC.y + (PPCL / 2)) / PPCL);
  const { map } = tagpro;
  // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
  const traversableCells = getMapTraversabilityInCells(map);

  _.forEach(getShortestCellPath(
    { xc: enemyFC.xc, yc: enemyFC.yc },
    { xc: enemyFinalTarget.xc, yc: enemyFinalTarget.yc },
    traversableCells,
  ), cell => enemyShortestPath.push(cell));

  // Set goal as the interception point
  const interceptionCell = _.find(enemyShortestPath, cell =>
    Math.sqrt((((cell.yc * PPCL) - me.y) ** 2) + (((cell.xc * PPCL) - me.x) ** 2)) <
      Math.sqrt((((cell.yc * PPCL) - enemyFC.y) ** 2) + (((cell.xc * PPCL) - enemyFC.x) ** 2)));
  if (interceptionCell) {
    goal.xp = interceptionCell.xc * PPCL;
    goal.yp = interceptionCell.yc * PPCL;
  } else {
    goal.xp = enemyFC.x + enemyFC.vx;
    goal.yp = enemyFC.y + enemyFC.vy;
  }
}
