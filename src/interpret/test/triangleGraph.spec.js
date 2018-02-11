import test from 'tape';

import {
  getUnmergedGraph,
  getMergedGraph,
  initNavMesh,
  __RewireAPI__ as SetupRewireAPI,
} from '../setup';
import { Point } from '../point';
import { Triangle } from '../triangle';
import { TGraph } from '../triangleGraph';
import { updateUnmergedGraph, updateMergedGraph } from '../mapToGraph';
import { setupTiles, teardownTiles } from './setupTiles.spec';


test('findContainingTriangles finds containing triangles', t => {
  const tGraph = new TGraph();
  const p1 = new Point(0, 0);
  const p2 = new Point(-3, 8);
  const p3 = new Point(0, 10);
  const p4 = new Point(40, 40);
  const p5 = new Point(-40, 40);
  const t1 = new Triangle(p1, p2, p3);
  const t2 = new Triangle(p2, p3, p5);
  const t3 = new Triangle(p1, p3, p4);
  tGraph.addTriangle(t1);
  tGraph.addTriangle(t2);
  tGraph.addTriangle(t3);
  const c1 = tGraph.findContainingTriangles(new Point(1, 5));
  const c2 = tGraph.findContainingTriangles(new Point(0, 2));

  t.is(c1[0], t3);
  t.is(c1.length, 1);
  t.is(c2.length, 2);

  t.end();
});


test('triangulateRegion does not create flat triangle when points are in a line', t => {
  const tGraph = new TGraph();
  const p1 = new Point(1080, 640);
  const p2 = new Point(1200, 680);
  const p3 = new Point(1200, 720);
  const p4 = new Point(1200, 760);
  tGraph.addEdgeAndVertices(p1, p2);
  tGraph.addEdgeAndVertices(p2, p3);
  tGraph.addEdgeAndVertices(p3, p4);
  tGraph.addEdgeAndVertices(p4, p1);
  tGraph.addFixedEdge({ p1, p2: p4 });
  t.doesNotThrow(() => tGraph.triangulateRegion([p1, p2, p3, p4]));

  t.true(tGraph.findTriangle(p1, p4, p3) !== null);
  t.true(tGraph.findTriangle(p1, p2, p3) !== null);
  t.true(tGraph.findTriangle(p1, p4, p2) === null);

  t.end();
});


test('delaunayRemoveVertex', tester => {
  tester.test('removes vertex surrounded by 4 points, and validly retriangulates 4 points', t => {
    const mockDTGraph = new TGraph();
    const v0 = new Point(0, 0);
    const v1 = new Point(0, 10);
    const v2 = new Point(10, 10);
    const v3 = new Point(10, 0);
    const p = new Point(3, 6);
    mockDTGraph.addTriangle(new Triangle(p, v0, v1));
    mockDTGraph.addTriangle(new Triangle(p, v1, v2));
    mockDTGraph.addTriangle(new Triangle(p, v2, v3));
    mockDTGraph.addTriangle(new Triangle(p, v3, v0));
    mockDTGraph.delaunayRemoveVertex(p);

    t.is(mockDTGraph.triangles.size, 2);
    t.is(mockDTGraph.getVertices().length, 4);
    t.is(mockDTGraph.getEdges().length, 5);
    // One of the diagonals is connected
    t.true(mockDTGraph.isConnected(v0, v2) !== mockDTGraph.isConnected(v1, v3));

    t.end();
  });

  tester.test('removes vertex surrounded by 5 points, and validly retriangulates 5 points', t => {
    const mockDTGraph = new TGraph();
    const v0 = new Point(0, 0);
    const v1 = new Point(0, 10);
    const v2 = new Point(10, 10);
    const v3 = new Point(10, 0);
    const v4 = new Point(-3, 5);
    const p = new Point(3, 6);
    // Create a pentagon, with p in the center connected to all other vertices
    mockDTGraph.addTriangle(new Triangle(p, v0, v4));
    mockDTGraph.addTriangle(new Triangle(p, v4, v1));
    mockDTGraph.addTriangle(new Triangle(p, v1, v2));
    mockDTGraph.addTriangle(new Triangle(p, v2, v3));
    mockDTGraph.addTriangle(new Triangle(p, v3, v0));
    mockDTGraph.delaunayRemoveVertex(p);

    t.is(mockDTGraph.triangles.size, 3);
    t.is(mockDTGraph.getVertices().length, 5);
    t.is(mockDTGraph.getEdges().length, 7);
    // Triangle on the left of the square is connected
    t.true(mockDTGraph.isConnected(v0, v1));
    // One of the diagonals is connected
    t.true(mockDTGraph.isConnected(v0, v2) !== mockDTGraph.isConnected(v1, v3));

    t.end();
  });
});


test('dynamicUpdate', tester => {
  tester.test('single NT tile', t => {
    setupTiles();
    const mockDTGraph = new TGraph();
    SetupRewireAPI.__Rewire__('dtGraph', mockDTGraph);
    const map = [
      [2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2],
      [2, 2, 10, 2, 2],
      [2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2],
    ];
    initNavMesh(map, true);

    t.is(mockDTGraph.numFixedEdges(), 8);
    t.is(mockDTGraph.numEdges(), 17);
    t.is(mockDTGraph.numTriangles(), 10);

    map[2][2] = '10.1';
    updateUnmergedGraph(getUnmergedGraph(), map, 2, 2);
    const { unfixEdges, constrainingEdges, removeVertices, addVertices } =
      updateMergedGraph(getMergedGraph(), getUnmergedGraph(), map, 2, 2);
    mockDTGraph.dynamicUpdate(unfixEdges, constrainingEdges, removeVertices, addVertices);

    t.is(unfixEdges.length, 4);
    t.is(constrainingEdges.length, 0);
    t.is(removeVertices.length, 4);
    t.is(addVertices.length, 0);
    t.is(mockDTGraph.numTriangles(), 2);
    t.is(mockDTGraph.numVertices(), 4);
    t.is(mockDTGraph.numEdges(), 5);
    t.is(mockDTGraph.numFixedEdges(), 4);

    SetupRewireAPI.__ResetDependency__('dtGraph');
    teardownTiles();
    t.end();
  });
});
