import test from 'tape';
import {
  getHighestPoint,
  delaunayTriangulation,
  getDTGraph,
  __RewireAPI__ as TriangulationRewireAPI,
} from '../../src/navmesh/triangulation';
import { Point, TGraph } from '../../src/navmesh/graph';


test('getHighestPoint()', tester => {
  tester.test('returns the upper-rightmost point', t => {
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
    const mockDTGraph = new TGraph();
    TriangulationRewireAPI.__Rewire__('DTGraph', mockDTGraph);
    // Horizontal line between p1 and p4
    const p1 = new Point(0, 8);
    const p2 = new Point(19, 0);
    const p3 = new Point(19, 16);
    const p4 = new Point(20, 8);
    const vertices = [p1, p2, p3, p4];

    delaunayTriangulation(vertices, new Point(-100, 50), new Point(100, 50));
    const DTGraph = getDTGraph();
    t.true(DTGraph.isConnected(p1, p4));
    t.true(DTGraph.isConnected(p1, p2));
    t.true(DTGraph.isConnected(p1, p3));
    t.true(DTGraph.isConnected(p2, p4));
    t.true(DTGraph.isConnected(p3, p4));
    t.false(DTGraph.isConnected(p2, p3));
    t.is(DTGraph.getEdges().length, 5);
    t.is(DTGraph.getVertices().length, 4);
    t.is(DTGraph.triangles.size, 2);
    t.is(DTGraph.polypoints.getVertices().length, 7);
    t.is(DTGraph.polypoints.getEdges().length, 6);
    TriangulationRewireAPI.__ResetDependency__('DTGraph');

    t.end();
  });

  tester.test('creates legal vertical line', t => {
    const mockDTGraph = new TGraph();
    TriangulationRewireAPI.__Rewire__('DTGraph', mockDTGraph);
    // Vertical line between p2 and p3
    const p1 = new Point(0, 8);
    const p2 = new Point(13, 0);
    const p3 = new Point(13, 16);
    const p4 = new Point(20, 8);
    const vertices = [p1, p2, p3, p4];

    delaunayTriangulation(vertices, new Point(-100, 50), new Point(100, 50));
    const DTGraph = getDTGraph();
    t.false(DTGraph.isConnected(p1, p4));
    t.true(DTGraph.isConnected(p1, p2));
    t.true(DTGraph.isConnected(p1, p3));
    t.true(DTGraph.isConnected(p2, p4));
    t.true(DTGraph.isConnected(p3, p4));
    t.true(DTGraph.isConnected(p2, p3));
    t.is(DTGraph.getEdges().length, 5);
    t.is(DTGraph.getVertices().length, 4);
    t.is(DTGraph.triangles.size, 2);
    t.is(DTGraph.polypoints.getVertices().length, 7);
    t.is(DTGraph.polypoints.getEdges().length, 6);
    TriangulationRewireAPI.__ResetDependency__('DTGraph');

    t.end();
  });

  tester.test('works when point is on existing line', t => {
    const mockDTGraph = new TGraph();
    TriangulationRewireAPI.__Rewire__('DTGraph', mockDTGraph);
    const p1 = new Point(0, 0);
    const p2 = new Point(0, 10);
    const p3 = new Point(-3, 8);
    const p4 = new Point(0, 2); // on line between p1 and p2
    const vertices = [p1, p2, p3, p4];

    delaunayTriangulation(vertices, new Point(-40, 40), new Point(40, 40));
    const DTGraph = getDTGraph();
    t.is(DTGraph.getVertices().length, 4);
    t.is(DTGraph.triangles.size, 2);
    TriangulationRewireAPI.__ResetDependency__('DTGraph');

    t.end();
  });

  tester.end();
});
