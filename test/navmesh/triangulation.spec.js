import test from 'tape';
import sinon from 'sinon';
import {
  getHighestPoint,
  delaunayTriangulation,
  getDTGraph,
  __RewireAPI__ as TriangulationRewireAPI,
} from '../../src/navmesh/triangulation';
import { Point } from '../../src/navmesh/graph';


test('getHighestPoint()', tester => {
  tester.test('return the upper-rightmost point', t => {
    const p1 = new Point(3, 0);
    const p2 = new Point(0, 0);
    const p3 = new Point(5, 1);
    const p4 = new Point(4, 0);
    const vertices = [p1, p2, p3, p4];

    t.is(getHighestPoint(vertices), p4);

    t.end();
  });
  tester.end();
});


test('delaunayTriangulation()', tester => {
  tester.test('creates legal horizontal line', t => {
    // Horizontal line between p1 and p4
    const p1 = new Point(0, 8);
    const p2 = new Point(19, 0);
    const p3 = new Point(19, 16);
    const p4 = new Point(20, 8);
    const vertices = [p1, p2, p3, p4];

    const temp = delaunayTriangulation(vertices);
    const DTGraph = getDTGraph();
    t.is(DTGraph, '');
    t.true(DTGraph.isConnected(p1, p4));
    t.same(DTGraph.getEdges().length, 5);

    t.end();
  });

  /*
  tester.test('creates legal vertical line', t => {
    // Vertical line between p2 and p3
    const p1 = new Point(0, 8);
    const p2 = new Point(15, 0);
    const p3 = new Point(15, 16);
    const p4 = new Point(20, 8);
    const vertices = [p1, p2, p3, p4];

    delaunayTriangulation(vertices);
    t.true(getDTGraph().isConnected(p2, p3));

    t.end();
  });
  */
  tester.end();
});
