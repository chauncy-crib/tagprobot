import _ from 'lodash';
import work from 'webworkify-webpack';

import { assert } from '../global/utils';
import { PolypointState } from './class/PolypointState';


const funnelWorker = work(require.resolve('./funnel.worker.js'));
let currentFunnelledPath = null;
let loading = false;


funnelWorker.addEventListener('message', ev => {
  if (ev.data.text === 'DONE') {
    currentFunnelledPath = _.map(JSON.parse(ev.data.funnelledPath), stateObj => (
      (new PolypointState()).fromObject(stateObj)
    ));
    loading = false;
  }
});


/**
 * @param {PolypointState[]} path
 * @param {TriangleGraph} triangleGraph
 * @returns {[Point[], Point[]]} list of the left and right points in each
 *   portal, where the edge (leftPoints[n], rightPoints[n]) represents the nth portal
 */
function getPortals(path, triangleGraph) {
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
    p1.setClearancePoint(triangleGraph.getClearancePoint(p1));
    p2.setClearancePoint(triangleGraph.getClearancePoint(p2));

    if (i === 1) {
      // This is the first iteration, arbitrarily add one point to each list
      leftPoints.push(p1);
      rightPoints.push(p2);
    } else {
      // Consecutive portals are connected by one same point, figure out which point to add to which
      //   list by checking which list ends in one of the portal points
      const p1IsRepeat = _.last(leftPoints).equals(p1) || _.last(rightPoints).equals(p1);
      const repeatPoint = p1IsRepeat ? p1 : p2;
      const otherPoint = p1IsRepeat ? p2 : p1;
      if (_.last(leftPoints).equals(repeatPoint)) {
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
  lastState.point.setClearancePoint(lastState.point.copy());
  rightPoints.push(lastState.point);
  leftPoints.push(lastState.point);

  return [leftPoints, rightPoints];
}


/**
 * @param {PolypointState[]} path
 * @param {TriangleGraph} triangleGraph
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelPolypoints(path, triangleGraph) {
  // Don't bother funnelling if our path has no intermediate polypoints, or the path is null
  if (!path || path.length <= 2) return path;

  if (!loading) {
    loading = true;
    const allPortalPoints = getPortals(path, triangleGraph);
    funnelWorker.postMessage({ text: 'FUNNEL_PATH', path, allPortalPoints });
  }

  // Force the first point in the funnelledPath to be our current position even if we use an old
  //   funnelledPath
  if (currentFunnelledPath) [currentFunnelledPath[0]] = path;
  return currentFunnelledPath;
}
