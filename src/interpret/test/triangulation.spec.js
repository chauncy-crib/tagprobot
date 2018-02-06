import test from 'tape';

import { Point } from '../point';
import { TGraph } from '../triangleGraph';
import {
  delaunayTriangulation,
  getDTGraph,
  __RewireAPI__ as TriangulationRewireAPI,
} from '../graphToTriangulation';


test('delaunayTriangulation()', tester => {
  tester.test('creates legal horizontal line', t => {
    const mockDTGraph = new TGraph();
    TriangulationRewireAPI.__Rewire__('DTGraph', mockDTGraph);
    // Horizontal line between p1 and p4
    const p1 = new Point(0, 8);
    const p2 = new Point(19, 0);
    const p3 = new Point(19, 16);
    const p4 = new Point(20, 8);
    const mapGraph = {
      getEdges: () => [],
      getVertices: () => [p1, p2, p3, p4],
    };

    delaunayTriangulation(
      mapGraph,
      new Point(-100, 50),
      new Point(100, 50),
      new Point(0, -50),
      true,
    );
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
    t.is(DTGraph.polypoints.getVertices().length, 2);
    t.is(DTGraph.polypoints.getEdges().length, 1);
    TriangulationRewireAPI.__ResetDependency__('DTGraph');

    t.end();
  });

  tester.test('overwrites horizontal line when vertical line is constrained', t => {
    const mockDTGraph = new TGraph();
    TriangulationRewireAPI.__Rewire__('DTGraph', mockDTGraph);
    const p1 = new Point(0, 8);
    const p2 = new Point(19, 0);
    const p3 = new Point(19, 16);
    const p4 = new Point(20, 8);
    const mapGraph = {
      getEdges: () => [{ p1: p2, p2: p3 }], // Make a constrained edge between p2 and p3
      getVertices: () => [p1, p2, p3, p4],
    };

    delaunayTriangulation(
      mapGraph,
      new Point(-100, 50),
      new Point(100, 50),
      new Point(0, -50),
      true,
    );
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
    t.is(DTGraph.polypoints.getVertices().length, 2);
    t.is(DTGraph.polypoints.getEdges().length, 0);
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
    const mapGraph = {
      getEdges: () => [],
      getVertices: () => [p1, p2, p3, p4],
    };

    delaunayTriangulation(
      mapGraph,
      new Point(-100, 50),
      new Point(100, 50),
      new Point(0, -50),
      true,
    );
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
    t.is(DTGraph.polypoints.getVertices().length, 2);
    t.is(DTGraph.polypoints.getEdges().length, 1);
    TriangulationRewireAPI.__ResetDependency__('DTGraph');

    t.end();
  });

  tester.test('overwrites vertical line when horizontal line is constrained', t => {
    const mockDTGraph = new TGraph();
    TriangulationRewireAPI.__Rewire__('DTGraph', mockDTGraph);
    // Vertical line between p2 and p3
    const p1 = new Point(0, 8);
    const p2 = new Point(13, 0);
    const p3 = new Point(13, 16);
    const p4 = new Point(20, 8);
    const mapGraph = {
      getEdges: () => [{ p1, p2: p4 }], // Make a constrained edge between p1 and p4
      getVertices: () => [p1, p2, p3, p4],
    };

    delaunayTriangulation(
      mapGraph,
      new Point(-100, 50),
      new Point(100, 50),
      new Point(0, -50),
      true,
    );
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
    t.is(DTGraph.polypoints.getVertices().length, 2);
    t.is(DTGraph.polypoints.getEdges().length, 0);
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
    const mapGraph = {
      getEdges: () => [],
      getVertices: () => [p1, p2, p3, p4],
    };

    delaunayTriangulation(
      mapGraph,
      new Point(-40, 40),
      new Point(40, 40),
      new Point(0, -40),
      true,
    );
    const DTGraph = getDTGraph();
    t.is(DTGraph.getVertices().length, 4);
    t.is(DTGraph.triangles.size, 2);
    TriangulationRewireAPI.__ResetDependency__('DTGraph');

    t.end();
  });

  tester.test('creates correct polypoints and polyedges', t => {
    const mockDTGraph = new TGraph();
    TriangulationRewireAPI.__Rewire__('DTGraph', mockDTGraph);
    const p1 = new Point(0, 0);
    const p2 = new Point(0, 12);
    const p3 = new Point(12, 0);
    const p4 = new Point(12, 12);
    const mapGraph = {
      getEdges: () => [],
      getVertices: () => [p1, p2, p3, p4],
    };
    delaunayTriangulation(
      mapGraph,
      new Point(-200, -5),
      new Point(20, 200),
      new Point(13, -1),
      true,
    );
    const pp = getDTGraph().polypoints;

    // there are two valid triangulations for a square of vertices
    // (can draw the diagonal line two ways)
    const valid1 = pp.hasVertex(new Point(4, 8)) && pp.hasVertex(new Point(8, 4));
    const valid2 = pp.hasVertex(new Point(4, 4)) && pp.hasVertex(new Point(8, 8));
    t.is(pp.getVertices().length, 2);
    t.is(pp.getEdges().length, 1);
    t.true(valid1 || valid2);
    if (valid1) t.true(pp.isConnected(new Point(4, 8), new Point(8, 4)));
    if (valid2) t.true(pp.isConnected(new Point(4, 4), new Point(8, 8)));

    TriangulationRewireAPI.__ResetDependency__('DTGraph');
    t.end();
  });

  tester.end();
});
