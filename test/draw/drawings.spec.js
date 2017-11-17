import test from 'tape';
import sinon from 'sinon';

import { Point, Graph } from '../../src/navmesh/graph';
import { updatePath,
  clearSprites,
  drawPermanentNTSprites,
  generatePermanentNTSprites,
  updateNTSprites,
  drawNavMesh,
  __RewireAPI__ as DrawRewireAPI } from '../../src/draw/drawings';


test('updatePath', tester => {
  tester.test('checks isVisualMode', t => {
    const mockIsVisualMode = sinon.stub().returns(false);
    DrawRewireAPI.__Rewire__('isVisualMode', mockIsVisualMode);
    updatePath();
    t.is(mockIsVisualMode.callCount, 1);
    DrawRewireAPI.__ResetDependency__('isVisualMode');
    t.end();
  });

  tester.test('calls removeChild on each existing sprite', t => {
    const mockIsVisualMode = sinon.stub().returns(true);
    const mockRemoveChild = sinon.spy();
    const mockPathSprite = 'sprite';
    global.tagpro = {
      renderer: {
        layers: {
          background: { removeChild: mockRemoveChild, addChild: () => {} },
        },
      },
    };
    global.PIXI = { Graphics: class {} };

    DrawRewireAPI.__Rewire__('isVisualMode', mockIsVisualMode);
    DrawRewireAPI.__Rewire__('pathSprite', mockPathSprite);

    updatePath();

    t.is(mockRemoveChild.callCount, 1);
    t.true(mockRemoveChild.getCall(0).calledWithExactly('sprite'));

    DrawRewireAPI.__ResetDependency__('isVisualMode');
    DrawRewireAPI.__ResetDependency__('pathSprite');

    t.end();
  });

  tester.test('adds a new sprite for each item in path to the renderer', t => {
    const mockIsVisualMode = sinon.stub().returns(true);
    const mockAddChild = sinon.spy();
    const mockPathSprite = 'potato';
    const mockGetPixiSquare = sinon.stub();
    mockGetPixiSquare.onCall(0).returns('square1');
    mockGetPixiSquare.onCall(1).returns('square2');
    global.tagpro = {
      renderer: {
        layers: {
          background: { removeChild: () => {}, addChild: mockAddChild },
        },
      },
    };
    global.PIXI = { Graphics: class {} };
    DrawRewireAPI.__Rewire__('isVisualMode', mockIsVisualMode);
    DrawRewireAPI.__Rewire__('pathSprite', mockPathSprite);
    DrawRewireAPI.__Rewire__('getPixiSquare', mockGetPixiSquare);
    DrawRewireAPI.__Rewire__('PPCL', 1);

    updatePath([
      { xc: 0, yc: 1 },
      { xc: 2, yc: 3 },
    ]);

    t.is(mockGetPixiSquare.callCount, 2);
    t.is(mockAddChild.callCount, 1);
    t.true(mockGetPixiSquare.calledWith(0, 1));
    t.true(mockGetPixiSquare.calledWith(2, 3));
    t.true(mockAddChild.getCall(0).args[0] instanceof global.PIXI.Graphics);

    DrawRewireAPI.__ResetDependency__('isVisualMode');
    DrawRewireAPI.__ResetDependency__('pathSprite');
    DrawRewireAPI.__ResetDependency__('getPixiSquare');
    DrawRewireAPI.__ResetDependency__('PPCL');

    t.end();
  });

  tester.end();
});


test('clearSprites', tester => {
  tester.test('removes all sprites in permNTSprites, pathSprites, and tempNTSprites', t => {
    const mockRemoveChild = sinon.spy();
    global.tagpro = {
      renderer: {
        layers: {
          background: { removeChild: mockRemoveChild },
          foreground: { removeChild: mockRemoveChild },
        },
      },
    };

    DrawRewireAPI.__Rewire__('permNTSprite', 1);
    DrawRewireAPI.__Rewire__('pathSprite', 2);
    DrawRewireAPI.__Rewire__('polypointPathSprite', 3);
    DrawRewireAPI.__Rewire__('tempNTSprites', [[5, null], [null, 6]]);

    clearSprites();

    t.is(mockRemoveChild.callCount, 5);
    t.true(mockRemoveChild.calledWithExactly(1));
    t.true(mockRemoveChild.calledWithExactly(2));
    t.true(mockRemoveChild.calledWithExactly(3));
    t.false(mockRemoveChild.calledWithExactly(4));
    t.true(mockRemoveChild.calledWithExactly(5));
    t.true(mockRemoveChild.calledWithExactly(6));

    DrawRewireAPI.__ResetDependency__('permNTSprite');
    DrawRewireAPI.__ResetDependency__('pathSprite');
    DrawRewireAPI.__ResetDependency__('tempNTSprite');
    DrawRewireAPI.__ResetDependency__('polypointPathSprite');

    t.end();
  });
  tester.end();
});


test('drawPermanentNTSprites', tester => {
  tester.test('adds permanent sprites to the renderer', t => {
    const mockAddChild = sinon.spy();
    global.tagpro = { renderer: { layers: { background: { addChild: mockAddChild } } } };
    DrawRewireAPI.__Rewire__('permNTSprite', 'sprite');

    drawPermanentNTSprites();

    t.is(mockAddChild.callCount, 1);
    t.true(mockAddChild.calledWithExactly('sprite'));

    DrawRewireAPI.__ResetDependency__('permNTSprite');

    t.end();
  });
  tester.end();
});


test('generatePermanentNTSprites', tester => {
  tester.test('throws error when x, y out of bounds', t => {
    DrawRewireAPI.__Rewire__('CPTL', 1);
    t.throws(() => generatePermanentNTSprites(1, 0, [[0, 0, 0]]));
    t.throws(() => generatePermanentNTSprites(0, 1, [[0], [0], [0]]));
    DrawRewireAPI.__Rewire__('CPTL', 2);
    t.throws(() => generatePermanentNTSprites(1, 0, [[0, 0], [0, 0]]));
    DrawRewireAPI.__Rewire__('CPTL', 2);
    DrawRewireAPI.__ResetDependency__('CPTL');
    t.end();
  });

  tester.test('calls getPixiSquare for CPTL=1', t => {
    const mockGetPixiSquare = sinon.spy();

    DrawRewireAPI.__Rewire__('getPixiSquare', mockGetPixiSquare);
    DrawRewireAPI.__Rewire__('CPTL', 1);
    DrawRewireAPI.__Rewire__('PPCL', 40);

    generatePermanentNTSprites(0, 0, [[1, 0, 1]]);
    t.false(mockGetPixiSquare.called);

    generatePermanentNTSprites(0, 1, [[1, 0, 1]]);
    t.is(mockGetPixiSquare.callCount, 1);
    t.true(mockGetPixiSquare.calledWith(0, 40));

    DrawRewireAPI.__ResetDependency__('getPixiSquare');
    DrawRewireAPI.__ResetDependency__('CPTL');
    DrawRewireAPI.__ResetDependency__('PPCL');

    t.end();
  });

  tester.test('stores correct values in permNTSprites and calls getPixiSquare for CPTL=2', t => {
    const mockGetPixiSquare = sinon.spy();
    const mockPermNTSprites = [];

    DrawRewireAPI.__Rewire__('permNTSprites', mockPermNTSprites);
    DrawRewireAPI.__Rewire__('getPixiSquare', mockGetPixiSquare);
    DrawRewireAPI.__Rewire__('CPTL', 2);
    DrawRewireAPI.__Rewire__('PPCL', 20);

    generatePermanentNTSprites(0, 0, [[1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1]]);
    t.notok(mockGetPixiSquare.called);

    generatePermanentNTSprites(0, 1, [[1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1]]);

    t.is(mockGetPixiSquare.callCount, 2);
    t.true(mockGetPixiSquare.calledWith(0, 40, 20));
    t.true(mockGetPixiSquare.calledWith(20, 60, 20));

    DrawRewireAPI.__ResetDependency__('permNTSprites');
    DrawRewireAPI.__ResetDependency__('getPixiSquare');
    DrawRewireAPI.__ResetDependency__('CPTL');
    DrawRewireAPI.__ResetDependency__('PPCL');

    t.end();
  });
  tester.end();
});


test('updateNTSprites', tester => {
  tester.test('adds/deletes the correct sprites from tempNTSprites', t => {
    const mockGetPixiSquare = sinon.stub();
    mockGetPixiSquare.withArgs(0, 80, 20).returns('square1');
    mockGetPixiSquare.withArgs(20, 60, 20).returns('square2');
    mockGetPixiSquare.withArgs(20, 100, 20).returns('square3');

    const mockTempNTSprites = [
      [null, null, 1, 1, null, 1],
      [null, 1, 1, null, 1, null],
    ];
    const cellTraversabilities = [
      [1, 1, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0],
    ];

    const mockAddChild = sinon.spy();
    const mockRemoveChild = sinon.spy();
    global.tagpro = {
      renderer: {
        layers: {
          background: { addChild: mockAddChild, removeChild: mockRemoveChild },
        },
      },
    };

    DrawRewireAPI.__Rewire__('CPTL', 2);
    DrawRewireAPI.__Rewire__('PPCL', 20);
    DrawRewireAPI.__Rewire__('getPixiSquare', mockGetPixiSquare);
    DrawRewireAPI.__Rewire__('tempNTSprites', mockTempNTSprites);

    updateNTSprites(0, 1, cellTraversabilities);
    updateNTSprites(0, 2, cellTraversabilities);

    t.same(mockTempNTSprites, [
      [null, null, 1, 1, 'square1', null],
      [null, 1, null, 'square2', 1, 'square3'],
    ]);

    DrawRewireAPI.__ResetDependency__('CPTL');
    DrawRewireAPI.__ResetDependency__('PPCL');
    DrawRewireAPI.__ResetDependency__('getPixiSquare');
    DrawRewireAPI.__ResetDependency__('tempNTSprites');

    t.end();
  });
  tester.end();
});


test('drawNavMesh()', tester => {
  tester.test('does nothing if visual mode is off', t => {
    const mockIsVisualMode = sinon.stub().returns(false);
    const mockDrawGraph = sinon.spy();
    const mockGetDTGraph = sinon.stub().returns(null);
    DrawRewireAPI.__Rewire__('isVisualMode', mockIsVisualMode);
    DrawRewireAPI.__Rewire__('drawGraph', mockDrawGraph);
    DrawRewireAPI.__Rewire__('getDTGraph', mockGetDTGraph);

    drawNavMesh();

    t.is(mockIsVisualMode.callCount, 1);
    t.is(mockDrawGraph.callCount, 0);

    DrawRewireAPI.__ResetDependency__('isVisualMode');
    DrawRewireAPI.__ResetDependency__('drawGraph');
    DrawRewireAPI.__ResetDependency__('getDTGraph');
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
    const mockDrawGraph = sinon.spy();
    const mockGetDTGraph = sinon.stub().returns(mockGraph);
    DrawRewireAPI.__Rewire__('getGraphGraphics', mockDrawGraph);
    DrawRewireAPI.__Rewire__('getDTGraph', mockGetDTGraph);
    DrawRewireAPI.__Rewire__('NAV_MESH_THICKNESS', 'thick');
    DrawRewireAPI.__Rewire__('NAV_MESH_EDGE_COLOR', 'brown');
    DrawRewireAPI.__Rewire__('NAV_MESH_VERTEX_COLOR', 'morebrown');
    global.tagpro = {
      renderer: {
        layers: {
          foreground: { addChild: () => {} },
        },
      },
    };

    drawNavMesh();
    t.true(mockDrawGraph.calledWith(mockGraph, 'thick', 'brown', 'morebrown'));

    DrawRewireAPI.__ResetDependency__('drawGraph');
    DrawRewireAPI.__ResetDependency__('getDTGraph');
    DrawRewireAPI.__ResetDependency__('NAV_MESH_THICKNESS');
    DrawRewireAPI.__ResetDependency__('NAV_MESH_EDGE_COLOR');
    DrawRewireAPI.__ResetDependency__('NAV_MESH_VERTEX_COLOR');
    t.end();
  });
  tester.end();
});
