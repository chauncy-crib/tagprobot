import test from 'tape';

import { Point } from '../Point';
import { Edge } from '../Edge';
import { Vector } from '../Vector';


function edgesAreRoughlyEqual(e1, e2, threshold = 0.000001) {
  return e1.p1.distance(e2.p1) <= threshold && e1.p2.distance(e2.p2) <= threshold;
}


test('Vector.getPerpindicularEdgeBisectedByTip()', tester => {
  tester.test('returns correct edge when Vector is vertical', t => {
    const mockVector = new Vector(0, 1);
    const edgeLength = 1;

    const resultedEdge = mockVector.getPerpindicularEdgeBisectedByTip(edgeLength);
    const desiredEdge = new Edge(new Point(-0.5, 1.0), new Point(0.5, 1.0));
    t.true(edgesAreRoughlyEqual(resultedEdge, desiredEdge));

    t.end();
  });

  tester.test('returns correct edge when Vector is horizontal', t => {
    const mockVector = new Vector(1, 0);
    const edgeLength = 1;

    const resultedEdge = mockVector.getPerpindicularEdgeBisectedByTip(edgeLength);
    const desiredEdge = new Edge(new Point(1.0, 0.5), new Point(1.0, -0.5));
    t.true(edgesAreRoughlyEqual(resultedEdge, desiredEdge));

    t.end();
  });

  tester.test('returns correct edge when Vector is at 45 degree angle', t => {
    const mockVector = new Vector(1, 1);
    const edgeLength = 5;

    const resultedEdge = mockVector.getPerpindicularEdgeBisectedByTip(edgeLength);
    const desiredEdge = new Edge(new Point(-0.767767, 2.767767), new Point(2.767767, -0.767767));
    t.true(edgesAreRoughlyEqual(resultedEdge, desiredEdge));

    t.end();
  });
});
