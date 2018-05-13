import _ from 'lodash';

import { Edge } from '../global/class/Edge';
import { Point } from '../global/class/Point';
import { PolypointState } from './class/PolypointState';
import { Triangle } from '../interpret/class/Triangle';


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
 * @param {[Point[], Point[]]} allPortalPoints
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelPolypointsFromPortals(path, allPortalPoints) {
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


export default function worker(self) {
  self.addEventListener('message', ev => {
    if (ev.data.text === 'FUNNEL_PATH') {
      const path = _.map(ev.data.path, stateObj => (new PolypointState()).fromObject(stateObj));
      const allPortalPoints = _.map(ev.data.allPortalPoints, pointArray => (
        _.map(pointArray, pointObj => ((new Point()).fromObject(pointObj)))
      ));

      const funnelledPath = funnelPolypointsFromPortals(path, allPortalPoints);
      self.postMessage({ text: 'DONE', funnelledPath: JSON.stringify(funnelledPath) });
    }
  });
}
