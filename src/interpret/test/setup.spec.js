import test from 'tape';

import { getDTGraph, delaunayTriangulation, __RewireAPI__ as SetupRewireAPI } from '../setup';
import { Point } from '../class/Point';
import { Edge } from '../class/Edge';
import { TriangleGraph } from '../class/TriangleGraph';
import { setupPixiAndTagpro, resetPixiAndTagpro } from '../../draw/class/test/DrawableGraph.spec';


test('delaunayTriangulation()', tester => {
  tester.test('creates legal horizontal line', t => {
    setupPixiAndTagpro();
    SetupRewireAPI.__Rewire__('dtGraph', new TriangleGraph());

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
    );
    t.true(getDTGraph().isConnected(p1, p4));
    t.true(getDTGraph().isConnected(p1, p2));
    t.true(getDTGraph().isConnected(p1, p3));
    t.true(getDTGraph().isConnected(p2, p4));
    t.true(getDTGraph().isConnected(p3, p4));
    t.false(getDTGraph().isConnected(p2, p3));
    t.is(getDTGraph().getEdges().length, 15);
    t.is(getDTGraph().getVertices().length, 7);
    t.is(getDTGraph().numTriangles(), 9);
    t.is(getDTGraph().polypoints.getVertices().length, 9);
    t.is(getDTGraph().polypoints.getEdges().length, 12);

    resetPixiAndTagpro();
    SetupRewireAPI.__ResetDependency__('dtGraph');

    t.end();
  });

  tester.test('overwrites horizontal line when vertical line is constrained', t => {
    setupPixiAndTagpro();
    SetupRewireAPI.__Rewire__('dtGraph', new TriangleGraph());

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
    );
    t.false(getDTGraph().isConnected(p1, p4));
    t.true(getDTGraph().isConnected(p1, p2));
    t.true(getDTGraph().isConnected(p1, p3));
    t.true(getDTGraph().isConnected(p2, p4));
    t.true(getDTGraph().isConnected(p3, p4));
    t.true(getDTGraph().isConnected(p2, p3));
    t.is(getDTGraph().getEdges().length, 15);
    t.is(getDTGraph().getVertices().length, 7);
    t.is(getDTGraph().numTriangles(), 9);
    t.is(getDTGraph().polypoints.getVertices().length, 9);
    t.is(getDTGraph().polypoints.getEdges().length, 11);

    resetPixiAndTagpro();
    SetupRewireAPI.__ResetDependency__('dtGraph');

    t.end();
  });

  tester.test('creates legal vertical line', t => {
    setupPixiAndTagpro();
    SetupRewireAPI.__Rewire__('dtGraph', new TriangleGraph());

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
    );
    t.false(getDTGraph().isConnected(p1, p4));
    t.true(getDTGraph().isConnected(p1, p2));
    t.true(getDTGraph().isConnected(p1, p3));
    t.true(getDTGraph().isConnected(p2, p4));
    t.true(getDTGraph().isConnected(p3, p4));
    t.true(getDTGraph().isConnected(p2, p3));
    t.is(getDTGraph().getEdges().length, 15);
    t.is(getDTGraph().getVertices().length, 7);
    t.is(getDTGraph().numTriangles(), 9);
    t.is(getDTGraph().polypoints.getVertices().length, 9);
    t.is(getDTGraph().polypoints.getEdges().length, 12);

    resetPixiAndTagpro();
    SetupRewireAPI.__ResetDependency__('dtGraph');

    t.end();
  });

  tester.test('overwrites vertical line when horizontal line is constrained', t => {
    setupPixiAndTagpro();
    SetupRewireAPI.__Rewire__('dtGraph', new TriangleGraph());

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
    );
    t.true(getDTGraph().isConnected(p1, p4));
    t.true(getDTGraph().isConnected(p1, p2));
    t.true(getDTGraph().isConnected(p1, p3));
    t.true(getDTGraph().isConnected(p2, p4));
    t.true(getDTGraph().isConnected(p3, p4));
    t.false(getDTGraph().isConnected(p2, p3));
    t.is(getDTGraph().getEdges().length, 15);
    t.is(getDTGraph().getVertices().length, 7);
    t.is(getDTGraph().numTriangles(), 9);
    t.is(getDTGraph().polypoints.getVertices().length, 9);
    t.is(getDTGraph().polypoints.getEdges().length, 11);

    resetPixiAndTagpro();
    SetupRewireAPI.__ResetDependency__('dtGraph');

    t.end();
  });

  tester.test('works when point is on existing line', t => {
    setupPixiAndTagpro();
    SetupRewireAPI.__Rewire__('dtGraph', new TriangleGraph());

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
    );
    t.is(getDTGraph().getVertices().length, 7);
    t.is(getDTGraph().numTriangles(), 9);

    resetPixiAndTagpro();
    SetupRewireAPI.__ResetDependency__('dtGraph');

    t.end();
  });

  tester.test('creates correct polypoints and polyedges', t => {
    setupPixiAndTagpro();
    SetupRewireAPI.__Rewire__('dtGraph', new TriangleGraph());

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
    );
    const pp = getDTGraph().polypoints;

    // there are two valid triangulations for a square of vertices
    // (can draw the diagonal line two ways)
    const valid1 = pp.hasVertex(new Point(4, 8)) && pp.hasVertex(new Point(8, 4));
    const valid2 = pp.hasVertex(new Point(4, 4)) && pp.hasVertex(new Point(8, 8));
    t.is(pp.getVertices().length, 9);
    t.is(pp.getEdges().length, 12);
    t.true(valid1 || valid2);
    if (valid1) t.true(pp.isConnected(new Point(4, 8), new Point(8, 4)));
    if (valid2) t.true(pp.isConnected(new Point(4, 4), new Point(8, 8)));

    resetPixiAndTagpro();
    SetupRewireAPI.__ResetDependency__('dtGraph');

    t.end();
  });
});
