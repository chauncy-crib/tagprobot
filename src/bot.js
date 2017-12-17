import { PPCL, BRP, LOOKAHEAD } from './constants';
import { getMapTraversabilityInCells } from './helpers/map';
import { getMe } from './helpers/player';
import { getShortestCellPath } from './helpers/path';
import { FSM } from './helpers/fsm';
import { isAutonomousMode, isVisualMode, move, dequeueChatMessages } from './utils/interface';
import { drawAllyCellPath, drawPolypointPath } from './draw/drawings';
import { desiredAccelerationMultiplier } from './helpers/physics';
import { getShortestPolypointPath } from './navmesh/path';
import { getDTGraph } from './navmesh/triangulation';


/**
 * @returns {{accX: number, accY: number}} The desired acceleration multipliers the bot should
 *   achieve with arrow key presses. Positive directions are down and right.
 */
function getAccelValues() {
  const { map } = tagpro;
  const me = getMe();

  const goal = FSM(me);
  me.xc = Math.floor((me.x + (PPCL / 2)) / PPCL);
  me.yc = Math.floor((me.y + (PPCL / 2)) / PPCL);

  const finalTarget = {
    xp: goal.xp,
    yp: goal.yp,
    xc: Math.floor(goal.xp / PPCL),
    yc: Math.floor(goal.yp / PPCL),
  };
  // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
  const traversableCells = getMapTraversabilityInCells(map);

  // TODO: runtime of this? Call is O(R) for now
  const shortestPath = getShortestCellPath(
    { xc: me.xc, yc: me.yc },
    { xc: finalTarget.xc, yc: finalTarget.yc },
    traversableCells,
  );
  const polypointShortestPath = getShortestPolypointPath(
    { xp: me.x + BRP, yp: me.y + BRP },
    finalTarget,
    getDTGraph(),
  );

  // Runtime: O(A), O(1) if visualizations off
  drawAllyCellPath(shortestPath);
  drawPolypointPath(polypointShortestPath);

  const target = { xp: me.x + BRP, yp: me.y + BRP };
  if (shortestPath) {
    const targetCell = shortestPath[Math.min(LOOKAHEAD + 1, shortestPath.length - 1)];
    target.xp = Math.floor((targetCell.xc + 0.5) * PPCL);
    target.yp = Math.floor((targetCell.yc + 0.5) * PPCL);
  } else {
    console.warn('Shortest path was null, using own location as target');
  }

  return desiredAccelerationMultiplier(
    me.x + BRP, // the x center of our ball, in pixels
    me.y + BRP, // the y center of our ball, in pixels
    me.vx, // our v velocity
    me.vy, // our y velocity
    target.xp, // the x we are seeking toward (pixels)
    target.yp, // the y we are seeking toward (pixels)
  );
}


/**
 * The base loop for defining the bot's behavior.
 */
export default function botLoop() {
  dequeueChatMessages();
  if (isAutonomousMode()) {
    move(getAccelValues());
  } else if (isVisualMode()) {
    getAccelValues();
  }
}
