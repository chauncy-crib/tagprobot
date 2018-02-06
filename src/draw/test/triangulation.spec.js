import test from 'tape';
import sinon from 'sinon';

import { toggleTriangulationVis, __RewireAPI__ as TriangulationRewireAPI } from '../triangulation';
import { Point } from '../../interpret/point';
import { Graph } from '../../interpret/graph';


test('toggleTriangulationVis()', tester => {
  tester.test('removed from the renderer when called with false', t => {
    const mockRemoveChild = sinon.stub();
    global.tagpro = {
      renderer: {
        layers: {
          foreground: { removeChild: mockRemoveChild },
        },
      },
    };
    TriangulationRewireAPI.__Rewire__('triangulationSprite', 'sprite');
    TriangulationRewireAPI.__Rewire__('trianglesOn', true);

    toggleTriangulationVis(false);

    t.is(mockRemoveChild.callCount, 1);
    t.true(mockRemoveChild.calledWith('sprite'));

    TriangulationRewireAPI.__ResetDependency__('triangulationSprite');
    TriangulationRewireAPI.__ResetDependency__('trianglesOn');
    t.end();
  });

  tester.test('calls drawGraph with correct graph object', t => {
    const mockGraph = new Graph();
    const middle = new Point(1000, 1000);
    const left = new Point(900, 1000);
    const down = new Point(1000, 1100);
    mockGraph.addEdgeAndVertices(middle, left);
    mockGraph.addEdgeAndVertices(middle, down);
    mockGraph.addEdgeAndVertices(down, left);
    const mockGetGraphGraphics = sinon.spy();
    const mockGetDTGraph = sinon.stub().returns(mockGraph);
    TriangulationRewireAPI.__Rewire__('getGraphGraphics', mockGetGraphGraphics);
    TriangulationRewireAPI.__Rewire__('getDTGraph', mockGetDTGraph);
    TriangulationRewireAPI.__Rewire__('NAV_MESH_THICKNESS', 'thick');
    TriangulationRewireAPI.__Rewire__('NAV_MESH_ALPHA', 'transparent');
    TriangulationRewireAPI.__Rewire__('NAV_MESH_VERTEX_COLOR', 'morebrown');
    TriangulationRewireAPI.__Rewire__('trianglesOn', false);
    global.tagpro = {
      renderer: {
        layers: {
          foreground: { addChild: () => {} },
        },
      },
    };
    toggleTriangulationVis(true);

    t.true(mockGetGraphGraphics.calledWith(mockGraph, 'thick', 'morebrown', 'transparent'));

    TriangulationRewireAPI.__ResetDependency__('getGraphGraphics');
    TriangulationRewireAPI.__ResetDependency__('getDTGraph');
    TriangulationRewireAPI.__ResetDependency__('NAV_MESH_THICKNESS');
    TriangulationRewireAPI.__ResetDependency__('NAV_MESH_ALPHA');
    TriangulationRewireAPI.__ResetDependency__('NAV_MESH_VERTEX_COLOR');
    TriangulationRewireAPI.__ResetDependency__('trianglesOn');
    global.tagpro = undefined;
    t.end();
  });

  tester.end();
});
