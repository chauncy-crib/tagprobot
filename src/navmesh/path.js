/**
 * Our A-star implementation is based on the pseudocode from this website:
 * http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
 */
import _ from 'lodash';
import { runAstar, State } from '../helpers/path';
import { assert } from '../../src/utils/asserts';
import { Point, Polypoint, pointsOnSameSide } from './graph';


export class PolypointState extends State {
  constructor(point) {
    super(null, null);
    this.point = point;
    this.key = point.toString();
  }

  /**
   * @param {PolypointState} targetState - the PolypointState object we are calculating the
   *   heuristic distance to
   * @returns {number} the heuristic distance from this state to the targetState
   */
  heuristic(targetState) {
    return this.point.distance(targetState.point);
  }

  equals(state) {
    return this.point.equal(state.point);
  }

  /**
   * @param {Graph} polypoints
   * @returns {PolypointState[]} an array of neighboring PolypointStates, with g values initialized
   *   to current node's g value + 1
   */
  neighbors(polypoints) {
    // Create states from neighbors
    const neighbors = _.map(polypoints.neighbors(this.point), n => new PolypointState(n));
    // Assign g values of neighbors
    _.forEach(neighbors, n => {
      n.g = this.g + n.point.distance(this.point);
      n.parent = this;
    });
    return neighbors;
  }
}


/**
 * @param {PolypointState[]} path
 * @returns {{leftPoints: Point[], rightPoints: Point[]}} list of the left and right points in each
 *   portal, where the edge (leftPoints[n], rightPoints[n]) represents the nth portal
 */
function getPortals(path) {
  const leftPoints = [];
  const rightPoints = [];
  for (let i = 1; i < path.length; i++) {
    // The two points in this portal are the two points shared by the previous triangle in the path
    const prevPoints = path[i - 1].point.t.getPoints();
    const thisPoints = path[i].point.t.getPoints();
    const portalPoints = _.intersectionBy(prevPoints, thisPoints, p => p.toString());
    assert(
      portalPoints.length === 2,
      `found ${portalPoints.length} shared points between triangles`,
    );
    const [p1, p2] = portalPoints;

    if (i === 1) {
      // This is the first iteration, arbitrarily add one point to each list
      leftPoints.push(p1);
      rightPoints.push(p2);
    } else {
      // Consecutive portals are connected by one same point, figure out which point to add to which
      //   list by checking which list ends in one of the portal points
      const p1IsRepeat = _.last(leftPoints).equal(p1) || _.last(rightPoints).equal(p1);
      const repeatPoint = p1IsRepeat ? p1 : p2;
      const otherPoint = p1IsRepeat ? p2 : p1;
      if (_.last(leftPoints).equal(repeatPoint)) {
        leftPoints.push(repeatPoint);
        rightPoints.push(otherPoint);
      } else {
        leftPoints.push(otherPoint);
        rightPoints.push(repeatPoint);
      }
    }
  }

  // Push the last state point to each list
  const lastState = _.last(path);
  rightPoints.push(lastState.point);
  leftPoints.push(lastState.point);

  return [leftPoints, rightPoints];
}


/**
 * @param {PolypointState[]} path
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelPolypoints(path) {
  const [leftPoints, rightPoints] = getPortals(path);

  const funnelledPath = [path[0]];
  let startPoint = path[0].point; // the apex of the funnel
  let leftI = 0; // the index in leftPoints of the left point of the funnel
  let rightI = 0; // the index in rightPoints of the right point of the funnel

  for (let portalIndex = 1; portalIndex < leftPoints.length; portalIndex++) {
    const currLeft = leftPoints[leftI];
    const currRight = rightPoints[rightI];
    const leftEdge = { p1: startPoint, p2: currLeft };
    const rightEdge = { p1: startPoint, p2: currRight };
    const newLeft = leftPoints[portalIndex];
    const newRight = rightPoints[portalIndex];

    if (!currLeft.equal(newLeft) && portalIndex > leftI) {
      // New left point is different
      if (pointsOnSameSide(newLeft, currRight, leftEdge)) {
        // New left point narrows the funnel
        if (pointsOnSameSide(newLeft, currLeft, rightEdge)) {
          // New left point does not cross over, update left side of funnel
          leftI = portalIndex;
        } else {
          // New left point crosses over other side
          // Insert right point to path
          funnelledPath.push(new PolypointState(currRight));
          // Restart funnel from right point
          startPoint = currRight;

          // Find next funnel index
          while (rightPoints[rightI].equal(currRight)) rightI += 1;
          leftI = rightI;
          portalIndex = rightI;
        }
      }
    }
    if (!currRight.equal(newRight) && portalIndex > rightI) {
      // New right point is different
      if (pointsOnSameSide(newRight, currLeft, rightEdge)) {
        // New right point narrows the funnel
        if (pointsOnSameSide(newRight, currRight, leftEdge)) {
          // New right point does not cross over, update right side of funnel
          rightI = portalIndex;
        } else {
          // New right point crosses over other side
          // Insert left point to path
          funnelledPath.push(new PolypointState(currLeft));
          // Restart funnel from left point
          startPoint = currLeft;

          // Find next funnel index
          while (leftPoints[leftI].equal(currLeft)) leftI += 1;
          rightI = leftI;
          portalIndex = leftI;
        }
      }
    }
  }

  // Add the target point
  funnelledPath.push(_.last(path));
  return funnelledPath;
}


/**
 * @param {Object} me - object with bot's position in pixels, xp and yp
 * @param {Object} target - object with target's position in pixels, xp and yp
 * @param {TGraph} tGraph - the triangulation graph to run Astar through
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 */
export function getShortestPolypointPath(me, target, tGraph) {
  assert(_.has(me, 'xp'));
  assert(_.has(me, 'yp'));
  assert(_.has(target, 'xp'));
  assert(_.has(target, 'yp'));

  const startTriangle = tGraph.findContainingTriangles(new Point(me.xp, me.yp))[0];
  const endTriangle = tGraph.findContainingTriangles(new Point(target.xp, target.yp))[0];
  assert(startTriangle, 'Could not find triangle for starting point');
  assert(endTriangle, 'Could not find triangle for ending point');
  const startState = new PolypointState(startTriangle.getCenter());
  const targetState = new PolypointState(endTriangle.getCenter());
  const path = runAstar(startState, targetState, tGraph.polypoints);

  // Place the starting and final locations on the path, and remove the polypoint in the triangle we
  //   are currently in
  const initialPositionState = new PolypointState(new Polypoint(me.xp, me.yp, startTriangle));
  const targetPositionState = new PolypointState(new Polypoint(target.xp, target.yp, endTriangle));
  const fullPath = [initialPositionState].concat(_.slice(path, 1, -1)).concat(targetPositionState);

  return funnelPolypoints(fullPath);
}
