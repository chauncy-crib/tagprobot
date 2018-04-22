import _ from 'lodash';

import { assert } from '../global/utils';
import { Edge } from '../interpret/class/Edge';
import { PolypointState } from './class/PolypointState';
import { Triangle } from '../interpret/class/Triangle';


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
  lastState.point.clearancePoint = lastState.point.copy();
  rightPoints.push(lastState.point);
  leftPoints.push(lastState.point);

  return [leftPoints, rightPoints];
}


/**
 * @param {Point[]} leftPoints
 * @param {Point[]} rightPoints
 * @param {Point} ballLocation
 * @param {PolypointState[]} path
 * @returns {number} the index to start the funnel algorithm at
 */
function getStartFunnelIndex([leftPoints, rightPoints], ballLocation, path) {
  let startingIndex = 0;

  const left = leftPoints[0];
  const right = rightPoints[0];
  // Two triangles that together make up the polygon [left, right, leftClearance, rightClearance]
  const polygon1 = new Triangle(left, right.clearancePoint, left.clearancePoint, false);
  const polygon2 = new Triangle(left, right.clearancePoint, right, false);

  if (polygon1.containsPoint(ballLocation) || polygon2.containsPoint(ballLocation)) {
    // Portal is behind us
    let leftFunnelEdge = new Edge(ballLocation, leftPoints[startingIndex].clearancePoint);
    let rightFunnelEdge = new Edge(ballLocation, rightPoints[startingIndex].clearancePoint);

    // Increment portal index until the portal is in front of us
    while (
      leftFunnelEdge.isBetweenPoints(
        path[startingIndex + 1].point,
        rightPoints[startingIndex].clearancePoint,
        false,
      ) ||
      rightFunnelEdge.isBetweenPoints(
        path[startingIndex + 1].point,
        leftPoints[startingIndex].clearancePoint,
        false,
      )
    ) {
      startingIndex += 1;
      leftFunnelEdge = new Edge(ballLocation, leftPoints[startingIndex].clearancePoint);
      rightFunnelEdge = new Edge(ballLocation, rightPoints[startingIndex].clearancePoint);
    }
  }

  return startingIndex;
}

/**
 * @param {PolypointState[]} path
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelPolypoints(path, triangleGraph) {
  // Don't bother funnelling if our path has no intermediate polypoints, or the path is null
  if (!path || path.length <= 2) return path;

  const allPortalPoints = getPortals(path, triangleGraph);
  const [leftPoints, rightPoints] = allPortalPoints;

  const funnelledPath = [path[0]];
  const ballLocation = path[0].point;
  const startingIndex = getStartFunnelIndex(allPortalPoints, ballLocation, path);

  // The indices of the current left and right funnel points in leftPoints and rightPoints
  const funnelIndices = [startingIndex, startingIndex];
  // The current base of the funnel, connects to the two funnel points to form the funnel V shape
  let funnelApex = ballLocation;

  // Loop through all the portals
  for (let portalIndex = startingIndex + 1; portalIndex < leftPoints.length; portalIndex++) {
    // Current funnel
    const currLeft = leftPoints[funnelIndices[0]];
    const currRight = rightPoints[funnelIndices[1]];
    const leftEdge = new Edge(funnelApex, currLeft.clearancePoint);
    const rightEdge = new Edge(funnelApex, currRight.clearancePoint);
    const funnelPoints = [currLeft, currRight];
    const funnelPointsClearanced = [currLeft.clearancePoint, currRight.clearancePoint];
    const edges = [leftEdge, rightEdge];

    // Current portal
    const newLeft = leftPoints[portalIndex];
    const newRight = rightPoints[portalIndex];
    const portalPoints = [newLeft, newRight];
    const portalPointsClearanced = [newLeft.clearancePoint, newRight.clearancePoint];

    // Look for possible funnel updates for the left (0) and right (1) side
    for (let curr = 0; curr < 2; curr++) {
      const other = 1 - curr; // the other side

      const differentPoint = !funnelPoints[curr].equals(portalPoints[curr]) &&
        portalIndex > funnelIndices[curr];
      const narrowsFunnel = !edges[curr].isBetweenPoints(
        portalPointsClearanced[curr],
        funnelPointsClearanced[other],
        false,
      );
      const crossesOver = edges[other].isBetweenPoints(
        portalPointsClearanced[curr],
        funnelPointsClearanced[curr],
        false,
      );

      if (differentPoint && narrowsFunnel) {
        if (crossesOver) {
          // Find next funnel index
          while (allPortalPoints[other][funnelIndices[other]].equals(funnelPoints[other])) {
            funnelIndices[other] += 1;
          }

          // Insert other point with clearance to path
          funnelledPath.push(new PolypointState(funnelPointsClearanced[other]));

          // Restart funnel from right point
          funnelApex = funnelPointsClearanced[other];
          funnelIndices[curr] = funnelIndices[other];
          portalIndex = funnelIndices[other];
        } else {
          // New point does not cross over, update that side of funnel
          funnelIndices[curr] = portalIndex;
        }
      }
    }
  }

  // Add the target point
  funnelledPath.push(_.last(path));
  return funnelledPath;
}
