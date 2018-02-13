import _ from 'lodash';

import { assert, pointsOnSameSide } from '../global/utils';
import { Point } from '../interpret/class/Point';
import { PolypointState } from './class/PolypointState';


const CLEARANCE = 19;


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
  rightPoints.push(lastState.point);
  leftPoints.push(lastState.point);

  return [leftPoints, rightPoints];
}


/**
 * @param {Point} cornerPoint - the point on the corner that needs clearance
 * @param {Point} prevPoint - the previous point on the corner
 * @param {Point} nextPoint - the next point on the corner
 * @returns {Point} a point that is CLEARANCE away from the cornerPoint in the corner's normal
 *   direction
 */
export function getClearancePoint(cornerPoint, prevPoint, nextPoint) {
  const nextAngle = Math.atan2(
    nextPoint.y - cornerPoint.y,
    nextPoint.x - cornerPoint.x,
  );
  const prevAngle = Math.atan2(
    prevPoint.y - cornerPoint.y,
    prevPoint.x - cornerPoint.x,
  );

  // Minimum distance between angles
  let distance = nextAngle - prevAngle;
  if (Math.abs(distance) > Math.PI) distance -= Math.PI * (distance > 0 ? 2 : -2);

  // Calculate perpendicular to average angle
  const angle = prevAngle + (distance / 2) + (Math.PI);

  const normal = new Point(Math.cos(angle), Math.sin(angle));

  // Insert other point to path
  return cornerPoint.add(normal.times(CLEARANCE));
}


/**
 * @param {PolypointState[]} path
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelPolypoints(path) {
  // Don't bother funnelling if our path has no intermediate polypoints
  if (path.length <= 2) return path;

  const allPortalPoints = getPortals(path);
  const [leftPoints, rightPoints] = allPortalPoints;

  const funnelledPath = [path[0]];
  let startPoint = path[0].point; // the apex of the funnel
  const funnelIndices = [1, 1]; // the indices of the left and right points in the funnel

  for (let portalIndex = 2; portalIndex < leftPoints.length; portalIndex++) {
    const currLeft = leftPoints[funnelIndices[0]];
    const currRight = rightPoints[funnelIndices[1]];
    const leftEdge = { p1: startPoint, p2: currLeft };
    const rightEdge = { p1: startPoint, p2: currRight };
    const newLeft = leftPoints[portalIndex];
    const newRight = rightPoints[portalIndex];

    const funnelPoints = [currLeft, currRight];
    const edges = [leftEdge, rightEdge];
    const portalPoints = [newLeft, newRight];

    // Look for funnel updates for the left and the right side
    for (let curr = 0; curr < 2; curr++) {
      const other = 1 - curr; // the other index
      if (!funnelPoints[curr].equals(portalPoints[curr]) && portalIndex > funnelIndices[curr]) {
        // New point is different
        if (pointsOnSameSide(portalPoints[curr], funnelPoints[other], edges[curr])) {
          // New point narrows the funnel
          if (pointsOnSameSide(portalPoints[curr], funnelPoints[curr], edges[other])) {
            // New point does not cross over, update that side of funnel
            funnelIndices[curr] = portalIndex;
          } else {
            // New point crosses over other side
            // Find previous funnel index
            let prevI = funnelIndices[other];
            while (allPortalPoints[other][prevI].equals(funnelPoints[other])) {
              prevI -= 1;
            }
            // Find next funnel index
            while (allPortalPoints[other][funnelIndices[other]].equals(funnelPoints[other])) {
              funnelIndices[other] += 1;
            }

            // Insert other point with clearance to path
            const clearancePoint = getClearancePoint(
              funnelPoints[other],
              allPortalPoints[other][prevI],
              allPortalPoints[other][funnelIndices[other]],
            );
            funnelledPath.push(new PolypointState(clearancePoint));

            // Restart funnel from right point
            startPoint = funnelPoints[other];
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
