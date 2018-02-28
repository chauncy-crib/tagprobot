import _ from 'lodash';

import { assert } from '../global/utils';
import { pointsOnSameSide } from '../interpret/utils';
import { Edge } from '../interpret/class/Edge';
import { PolypointState } from './class/PolypointState';


/**
 * @param {PolypointState[]} path
 * @returns {{leftPoints: Point[], rightPoints: Point[]}} list of the left and right points in each
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
    p1.clearancePoint = triangleGraph.getClearancePoint(p1);
    p2.clearancePoint = triangleGraph.getClearancePoint(p2);

    if (i === 1) {
      // This is the first iteration, add the first triangle point and then arbitrarily add one
      //   point to each list
      const trianglePoint = _.difference(prevPoints, portalPoints);
      leftPoints.push(trianglePoint[0]);
      rightPoints.push(trianglePoint[0]);
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
  lastState.point.clearancePoint = lastState.point.copy();
  rightPoints.push(lastState.point);
  leftPoints.push(lastState.point);

  return [leftPoints, rightPoints];
}


/**
 * @param {PolypointState[]} path
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelPolypoints(path, triangleGraph) {
  // Don't bother funnelling if our path has no intermediate polypoints
  if (path.length <= 2) return path;

  const allPortalPoints = getPortals(path, triangleGraph);
  const [leftPoints, rightPoints] = allPortalPoints;

  const funnelledPath = [path[0]];
  let startPoint = path[0].point; // the apex of the funnel
  const funnelIndices = [1, 1]; // the indices of the left and right points in the funnel

  for (let portalIndex = 2; portalIndex < leftPoints.length; portalIndex++) {
    const currLeft = leftPoints[funnelIndices[0]];
    const currRight = rightPoints[funnelIndices[1]];
    const leftEdge = new Edge(startPoint, currLeft.clearancePoint);
    const rightEdge = new Edge(startPoint, currRight.clearancePoint);
    const newLeft = leftPoints[portalIndex];
    const newRight = rightPoints[portalIndex];

    const funnelPoints = [currLeft, currRight];
    const funnelPointsClearanced = [currLeft.clearancePoint, currRight.clearancePoint];
    const edges = [leftEdge, rightEdge];
    const portalPoints = [newLeft, newRight];
    const portalPointsClearanced = [newLeft.clearancePoint, newRight.clearancePoint];

    // Look for funnel updates for the left and the right side
    for (let curr = 0; curr < 2; curr++) {
      const other = 1 - curr; // the other index
      if (!funnelPoints[curr].equals(portalPoints[curr]) && portalIndex > funnelIndices[curr]) {
        // New point is different
        if (pointsOnSameSide(
          portalPointsClearanced[curr],
          funnelPointsClearanced[other],
          edges[curr],
        )) {
          // New point narrows the funnel
          if (pointsOnSameSide(
            portalPointsClearanced[curr],
            funnelPointsClearanced[curr],
            edges[other],
          )) {
            // New point does not cross over, update that side of funnel
            funnelIndices[curr] = portalIndex;
          } else {
            // New point crosses over other side
            // Find next funnel index
            while (allPortalPoints[other][funnelIndices[other]].equals(funnelPoints[other])) {
              funnelIndices[other] += 1;
            }

            // Insert other point with clearance to path
            funnelledPath.push(new PolypointState(funnelPointsClearanced[other]));

            // Restart funnel from right point
            startPoint = funnelPointsClearanced[other];
            funnelIndices[curr] = funnelIndices[other];
            portalIndex = funnelIndices[other];
          }
        }
      }
    }
  }

  // Add the target point
  funnelledPath.push(_.last(path));
  return funnelledPath;
}
