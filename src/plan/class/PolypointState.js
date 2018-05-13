import _ from 'lodash';

import { enemyAvoidanceCost } from '../avoidance';
import { getMe } from '../../look/gameState';
import { State } from './State';
import { Point } from '../../global/class/Point';


export class PolypointState extends State {
  constructor(point = new Point()) {
    super(null, null);
    this.point = point;
    this.key = point.toString();
  }


  fromObject(o) {
    this.point = (new Point()).fromObject(o.point);
    this.key = this.point.toString();
    return this;
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
    return this.point.equals(state.point);
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
      // If we have the flag, apply the avoidance-cost
      if (getMe().flag) n.g += enemyAvoidanceCost(n.point);
      n.parent = this;
    });
    return neighbors;
  }
}
