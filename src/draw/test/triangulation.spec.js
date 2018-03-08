import test from 'tape';
import sinon from 'sinon';

import { toggleTriangulationVis, __RewireAPI__ as TriangulationRewireAPI } from '../triangulation';
import { Point } from '../../interpret/class/Point';
import { Edge } from '../../interpret/class/Edge';
import { Graph } from '../../interpret/class/Graph';


test('toggleTriangulationVis()', tester => {
  tester.test('removed from the renderer when called with false', t => {
    const mockRemoveChild = sinon.stub();
    global.tagpro = { renderer: { layers: { foreground: { removeChild: mockRemoveChild } } } };
    TriangulationRewireAPI.__Rewire__('triangulationSprite', 'sprite');
    TriangulationRewireAPI.__Rewire__('trianglesOn', true);

    toggleTriangulationVis(false);

    t.is(mockRemoveChild.callCount, 1);
    t.true(mockRemoveChild.calledWith('sprite'));

    global.tagpro = undefined;
    TriangulationRewireAPI.__ResetDependency__('triangulationSprite');
    TriangulationRewireAPI.__ResetDependency__('trianglesOn');
    t.end();
  });

  tester.test('calls drawGraph with correct graph object', t => {
    const mockGraph = new Graph();
    const middle = new Point(1000, 1000);
    const left = new Point(900, 1000);
    const down = new Point(1000, 1100);
    mockGraph.addEdgeAndVertices(new Edge(middle, left));
    mockGraph.addEdgeAndVertices(new Edge(middle, down));
    mockGraph.addEdgeAndVertices(new Edge(down, left));
    const mockGetGraphGraphics = sinon.spy();
    TriangulationRewireAPI.__Rewire__('getGraphGraphics', mockGetGraphGraphics);
    TriangulationRewireAPI.__Rewire__('getDTGraph', sinon.stub().returns(mockGraph));
    const mockThicknesses = { navMesh: 'thick' };
    TriangulationRewireAPI.__Rewire__('THICKNESSES', mockThicknesses);
    const mockColors = { navMesh: { vertex: 'brown' } };
    TriangulationRewireAPI.__Rewire__('COLORS', mockColors);
    const mockAlphas = { navMesh: { vertex: 'transparent' } };
    TriangulationRewireAPI.__Rewire__('ALPHAS', mockAlphas);
    TriangulationRewireAPI.__Rewire__('trianglesOn', false);
    global.tagpro = { renderer: { layers: { foreground: { addChild: () => {} } } } };
    toggleTriangulationVis(true);

    t.true(mockGetGraphGraphics.calledWith(mockGraph, 'thick', 'brown', 'transparent'));

    TriangulationRewireAPI.__ResetDependency__('getGraphGraphics');
    TriangulationRewireAPI.__ResetDependency__('dtGraph');
    TriangulationRewireAPI.__ResetDependency__('THICKNESSES');
    TriangulationRewireAPI.__ResetDependency__('COLORS');
    TriangulationRewireAPI.__ResetDependency__('ALPHAS');
    TriangulationRewireAPI.__ResetDependency__('trianglesOn');
    global.tagpro = undefined;
    t.end();
  });
});
