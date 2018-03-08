import test from 'tape';

import { getDTGraph, delaunayTriangulation, __RewireAPI__ as SetupRewireAPI } from '../setup';
import { Point } from '../class/Point';
import { Edge } from '../class/Edge';


test('delaunayTriangulation()', tester => {
  tester.test('creates legal horizontal line', t => {
    getDTGraph().clear();
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
    t.true(getDTGraph().isConnected(p1, p4));
    t.true(getDTGraph().isConnected(p1, p2));
    t.true(getDTGraph().isConnected(p1, p3));
    t.true(getDTGraph().isConnected(p2, p4));
    t.true(getDTGraph().isConnected(p3, p4));
    t.false(getDTGraph().isConnected(p2, p3));
    t.is(getDTGraph().getEdges().length, 5);
    t.is(getDTGraph().getVertices().length, 4);
    t.is(getDTGraph().triangles.size, 2);
    t.is(getDTGraph().polypoints.getVertices().length, 2);
    t.is(getDTGraph().polypoints.getEdges().length, 1);

    t.end();
  });

  tester.test('overwrites horizontal line when vertical line is constrained', t => {
    getDTGraph().clear();
    const p1 = new Point(0, 8);
    const p2 = new Point(19, 0);
    const p3 = new Point(19, 16);
    const p4 = new Point(20, 8);
    const mapGraph = {
      getEdges: () => [new Edge(p2, p3)], // Make a constrained edge between p2 and p3
      getVertices: () => [p1, p2, p3, p4],
    };

    delaunayTriangulation(
      mapGraph,
      new Point(-100, 50),
      new Point(100, 50),
      new Point(0, -50),
      true,
    );
    t.false(getDTGraph().isConnected(p1, p4));
    t.true(getDTGraph().isConnected(p1, p2));
    t.true(getDTGraph().isConnected(p1, p3));
    t.true(getDTGraph().isConnected(p2, p4));
    t.true(getDTGraph().isConnected(p3, p4));
    t.true(getDTGraph().isConnected(p2, p3));
    t.is(getDTGraph().getEdges().length, 5);
    t.is(getDTGraph().getVertices().length, 4);
    t.is(getDTGraph().triangles.size, 2);
    t.is(getDTGraph().polypoints.getVertices().length, 2);
    t.is(getDTGraph().polypoints.getEdges().length, 0);
    SetupRewireAPI.__ResetDependency__('getDTGraph()');

    t.end();
  });

  tester.test('creates legal vertical line', t => {
    getDTGraph().clear();
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
    t.false(getDTGraph().isConnected(p1, p4));
    t.true(getDTGraph().isConnected(p1, p2));
    t.true(getDTGraph().isConnected(p1, p3));
    t.true(getDTGraph().isConnected(p2, p4));
    t.true(getDTGraph().isConnected(p3, p4));
    t.true(getDTGraph().isConnected(p2, p3));
    t.is(getDTGraph().getEdges().length, 5);
    t.is(getDTGraph().getVertices().length, 4);
    t.is(getDTGraph().triangles.size, 2);
    t.is(getDTGraph().polypoints.getVertices().length, 2);
    t.is(getDTGraph().polypoints.getEdges().length, 1);

    t.end();
  });

  tester.test('overwrites vertical line when horizontal line is constrained', t => {
    getDTGraph().clear();
    // Vertical line between p2 and p3
    const p1 = new Point(0, 8);
    const p2 = new Point(13, 0);
    const p3 = new Point(13, 16);
    const p4 = new Point(20, 8);
    const mapGraph = {
      getEdges: () => [new Edge(p1, p4)], // Make a constrained edge between p1 and p4
      getVertices: () => [p1, p2, p3, p4],
    };

    delaunayTriangulation(
      mapGraph,
      new Point(-100, 50),
      new Point(100, 50),
      new Point(0, -50),
      true,
    );
    t.true(getDTGraph().isConnected(p1, p4));
    t.true(getDTGraph().isConnected(p1, p2));
    t.true(getDTGraph().isConnected(p1, p3));
    t.true(getDTGraph().isConnected(p2, p4));
    t.true(getDTGraph().isConnected(p3, p4));
    t.false(getDTGraph().isConnected(p2, p3));
    t.is(getDTGraph().getEdges().length, 5);
    t.is(getDTGraph().getVertices().length, 4);
    t.is(getDTGraph().triangles.size, 2);
    t.is(getDTGraph().polypoints.getVertices().length, 2);
    t.is(getDTGraph().polypoints.getEdges().length, 0);

    t.end();
  });

  tester.test('works when point is on existing line', t => {
    getDTGraph().clear();
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
    t.is(getDTGraph().getVertices().length, 4);
    t.is(getDTGraph().triangles.size, 2);

    t.end();
  });

  tester.test('creates correct polypoints and polyedges', t => {
    getDTGraph().clear();
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

    t.end();
  });
});
