import test from 'tape';
import _ from 'lodash';

import { Point } from '../../global/class/Point';
import { Polypoint } from '../../interpret/class/Polypoint';
import { Triangle } from '../../interpret/class/Triangle';
import { PolypointState } from '../class/PolypointState';
import { funnelPolypointsFromPortals } from '../funnel.worker';
import { getPortals } from '../portals';
import { backwardsFunnelPath, backwardsFunnelGetClearancePoint } from './backwardsFunnelData';


const mockGetClearancePoint = cornerPoint => cornerPoint.copy();


test('funnelPolypointsFromPortals()', tester => {
  tester.test('stretches around a corner to the top', t => {
    const mockTriangleGraph = { getClearancePoint: mockGetClearancePoint };
    const FP = [
      new Point(35, 75),
      new Point(107, 57),
      new Point(39, 132),
      new Point(95, 130), // first corner
      new Point(84, 180),
      new Point(157, 115),
      new Point(147, 195),
      new Point(218, 108), // second corner
      new Point(226, 166),
      new Point(286, 53),
      new Point(279, 188),
    ]; // funnel points
    const path = [
      new PolypointState(new Polypoint(71, 45, new Triangle(new Point(56, 28), FP[0], FP[1]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[0], FP[1], FP[2]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[1], FP[2], FP[3]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[2], FP[3], FP[4]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[3], FP[4], FP[5]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[4], FP[5], FP[6]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[5], FP[6], FP[7]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[6], FP[7], FP[8]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[7], FP[8], FP[9]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[8], FP[9], FP[10]))),
      new PolypointState(new Polypoint(293, 65, new Triangle(FP[9], FP[10], new Point(403, 118)))),
    ];

    const portals = getPortals(path, mockTriangleGraph);
    const funnelledPoints = funnelPolypointsFromPortals(path, portals).map(state => state.point);
    t.same(funnelledPoints.join('_'), [path[0].point, FP[3], FP[7], path[10].point].join('_'));

    t.end();
  });


  tester.test('stretches around a corner to the bottom', t => {
    const mockTriangleGraph = { getClearancePoint: mockGetClearancePoint };
    const FP = [
      new Point(35, 75),
      new Point(107, 57),
      new Point(39, 132),
      new Point(95, 130), // first corner
      new Point(84, 180),
      new Point(157, 115),
      new Point(147, 195),
      new Point(218, 108),
      new Point(226, 166), // second corner
      new Point(286, 53),
      new Point(279, 188), // third corner
    ]; // funnel points
    const path = [
      new PolypointState(new Polypoint(71, 45, new Triangle(new Point(56, 28), FP[0], FP[1]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[0], FP[1], FP[2]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[1], FP[2], FP[3]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[2], FP[3], FP[4]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[3], FP[4], FP[5]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[4], FP[5], FP[6]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[5], FP[6], FP[7]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[6], FP[7], FP[8]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[7], FP[8], FP[9]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[8], FP[9], FP[10]))),
      new PolypointState(new Polypoint(293, 201, new Triangle(FP[9], FP[10], new Point(403, 118)))),
    ];

    const portals = getPortals(path, mockTriangleGraph);
    const funnelledPoints = funnelPolypointsFromPortals(path, portals).map(state => state.point);
    t.same(
      funnelledPoints.join('_'),
      [path[0].point, FP[3], FP[8], FP[10], path[10].point].join('_'),
    );

    t.end();
  });


  tester.test('stretches properly around command center spawn point', t => {
    const mockTriangleGraph = { getClearancePoint: mockGetClearancePoint };
    const triangles = [
      new Triangle(new Point(760, 560), new Point(840, 600), new Point(800, 480)),
      new Triangle(new Point(800, 480), new Point(960, 640), new Point(840, 600)),
      new Triangle(new Point(840, 600), new Point(960, 640), new Point(960, 680)),
      new Triangle(new Point(840, 600), new Point(960, 680), new Point(960, 720)),
      new Triangle(new Point(1000, 720), new Point(960, 680), new Point(960, 720)),
      new Triangle(new Point(1120, 960), new Point(960, 720), new Point(1000, 720)),
      new Triangle(new Point(1120, 960), new Point(960, 720), new Point(1040, 1040)),
      new Triangle(new Point(920, 720), new Point(1040, 1040), new Point(960, 720)),
      new Triangle(new Point(920, 720), new Point(1040, 1040), new Point(880, 1080)),
      new Triangle(new Point(920, 720), new Point(880, 1080), new Point(760, 760)),
    ];
    const path = [
      new PolypointState(new Polypoint(696, 569, triangles[0])),
      new PolypointState(new Polypoint(null, null, triangles[1])),
      new PolypointState(new Polypoint(null, null, triangles[2])),
      new PolypointState(new Polypoint(null, null, triangles[3])),
      new PolypointState(new Polypoint(null, null, triangles[4])),
      new PolypointState(new Polypoint(null, null, triangles[5])),
      new PolypointState(new Polypoint(null, null, triangles[6])),
      new PolypointState(new Polypoint(null, null, triangles[7])),
      new PolypointState(new Polypoint(null, null, triangles[8])),
      new PolypointState(new Polypoint(880, 880, triangles[9])),
    ];

    const portals = getPortals(path, mockTriangleGraph);
    const funnelledPoints = funnelPolypointsFromPortals(path, portals).map(state => state.point);
    t.same(
      funnelledPoints.join('_'),
      [path[0].point, triangles[1].p3, triangles[3].p3, path[9].point].join('_'),
    );

    t.end();
  });


  tester.test('funnels properly with only two states in path', t => {
    const mockTriangleGraph = { getClearancePoint: mockGetClearancePoint };
    const triangles = [
      new Triangle(new Point(760, 560), new Point(840, 600), new Point(800, 480)),
      new Triangle(new Point(800, 480), new Point(960, 640), new Point(840, 600)),
    ];
    const path = [
      new PolypointState(new Polypoint(696, 569, triangles[0])),
      new PolypointState(new Polypoint(900, 600, triangles[1])),
    ];

    const portals = getPortals(path, mockTriangleGraph);
    const funnelledPoints = funnelPolypointsFromPortals(path, portals).map(state => state.point);
    t.same(funnelledPoints, [path[0].point, path[1].point]);

    t.end();
  });


  tester.test('funnels properly in stradle edge case', t => {
    const mockTriangleGraph = { getClearancePoint: backwardsFunnelGetClearancePoint };
    const portals = getPortals(backwardsFunnelPath, mockTriangleGraph);
    const funnelledPoints = funnelPolypointsFromPortals(backwardsFunnelPath, portals)
      .map(state => state.point);
    t.same(
      funnelledPoints.join('_'),
      [
        backwardsFunnelPath[0].point,
        new Point(1200, 360),
        _.last(backwardsFunnelPath).point,
      ].join('_'),
    );

    t.end();
  });
});
