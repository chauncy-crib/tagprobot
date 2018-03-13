import test from 'tape';
import sinon from 'sinon';

import { toggleTriangulationVis, __RewireAPI__ as TriangulationRewireAPI } from '../triangulation';


test('toggleTriangulationVis()', tester => {
  tester.test('calls dtGraph.turnOffDrawings() when called with false', t => {
    const mockDTGraph = {};
    mockDTGraph.turnOffDrawings = () => {};
    const mockTurnOffDrawings = sinon.spy(mockDTGraph, 'turnOffDrawings');

    TriangulationRewireAPI.__Rewire__('trianglesOn', true);
    TriangulationRewireAPI.__Rewire__(
      'getDTGraph',
      sinon.stub().returns(mockDTGraph),
    );

    toggleTriangulationVis(false);

    t.is(mockTurnOffDrawings.callCount, 1);

    TriangulationRewireAPI.__ResetDependency__('trianglesOn');
    TriangulationRewireAPI.__ResetDependency__('getDTGraph');
    t.end();
  });

  tester.test('calls dtGraph.turnOnDrawings() when called with true', t => {
    const mockDTGraph = {};
    mockDTGraph.turnOnDrawings = () => {};
    const mockTurnOnDrawing = sinon.spy(mockDTGraph, 'turnOnDrawings');

    TriangulationRewireAPI.__Rewire__('trianglesOn', false);
    TriangulationRewireAPI.__Rewire__(
      'getDTGraph',
      sinon.stub().returns(mockDTGraph),
    );

    toggleTriangulationVis(true);

    t.is(mockTurnOnDrawing.callCount, 1);

    TriangulationRewireAPI.__ResetDependency__('trianglesOn');
    TriangulationRewireAPI.__ResetDependency__('getDTGraph');
    t.end();
  });
});
