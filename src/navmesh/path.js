/**
 * Our A-star implementation is based on the pseudocode from this website:
 * http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
 */
import _ from 'lodash';
import { runAstar, State } from '../helpers/path';
import { assert } from '../../src/utils/asserts';
import { Point } from './graph';


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
      n.g = this.g + n.point.distance(this.point); // eslint-disable-line no-param-reassign
      n.parent = this; // eslint-disable-line no-param-reassign
    });
    return neighbors;
  }
}

/**
 * @param {Object} me - object with bot's position in pixels, xp and yp
 * @param {Object} target - object with target's position in pixels, xp and yp
 * @param {TGraph} tGraph - the triangulation graph to run Astar through
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 */
export function getShortestPath(me, target, tGraph) {
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

  // place the starting and final locations on the path, and remove the polypoint in the triangle we
  // are currently in
  const initialPositionState = new PolypointState(new Point(me.xp, me.yp));
  const targetPositionState = new PolypointState(new Point(target.xp, target.yp));
  return [initialPositionState].concat(path.slice(1)).concat(targetPositionState);
}
