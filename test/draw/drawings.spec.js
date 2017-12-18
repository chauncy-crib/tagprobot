import test from 'tape';
import sinon from 'sinon';

import { Point, Graph } from '../../src/navmesh/graph';
import {
  drawAllyCellPath,
  clearSprites,
  drawPermanentNTSprites,
  generatePermanentNTSprites,
  updateNTSprites,
  drawNavMesh,
  __RewireAPI__ as DrawRewireAPI,
} from '../../src/draw/drawings';


/* eslint-disable class-methods-use-this */


test('drawAllyCellPath', tester => {
  tester.test('checks isVisualMode', t => {
    const mockIsVisualMode = sinon.stub().returns(false);
    DrawRewireAPI.__Rewire__('isVisualMode', mockIsVisualMode);

    drawAllyCellPath();
    t.is(mockIsVisualMode.callCount, 1);

    DrawRewireAPI.__ResetDependency__('isVisualMode');
    t.end();
  });

  tester.test('calls removeChildren once', t => {
    const mockRemoveChildren = sinon.spy();
    global.PIXI = { Graphics: class { removeChildren() { mockRemoveChildren(); } } };
    const mockIsVisualMode = sinon.stub().returns(true);
    DrawRewireAPI.__Rewire__('isVisualMode', mockIsVisualMode);
    const mockAllyCellPathGraphics = new PIXI.Graphics();
    DrawRewireAPI.__Rewire__('allyCellPathGraphics', mockAllyCellPathGraphics);

    drawAllyCellPath();
    t.is(mockRemoveChildren.callCount, 1);

    global.PIXI = undefined;
    DrawRewireAPI.__ResetDependency__('isVisualMode');
    DrawRewireAPI.__ResetDependency__('allyCellPathGraphics');
    t.end();
  });

  tester.test('calls addChild and getPixiSquare for each cell in cellPath', t => {
    const mockAddChild = sinon.spy();
    global.PIXI = { Graphics: class { addChild() { mockAddChild(); } removeChildren() {} } };
    const mockIsVisualMode = sinon.stub().returns(true);
    DrawRewireAPI.__Rewire__('isVisualMode', mockIsVisualMode);
    const mockAllyCellPathGraphics = new PIXI.Graphics();
    DrawRewireAPI.__Rewire__('allyCellPathGraphics', mockAllyCellPathGraphics);
    const mockGetPixiSquare = sinon.stub();
    DrawRewireAPI.__Rewire__('getPixiSquare', mockGetPixiSquare);
    DrawRewireAPI.__Rewire__('PPCL', 1);

    drawAllyCellPath([{ xc: 0, yc: 1 }, { xc: 2, yc: 3 }]);
    t.is(mockAddChild.callCount, 2);
    t.is(mockGetPixiSquare.callCount, 2);
    t.true(mockGetPixiSquare.calledWith(0, 1));
    t.true(mockGetPixiSquare.calledWith(2, 3));

    global.PIXI = undefined;
    DrawRewireAPI.__ResetDependency__('isVisualMode');
    DrawRewireAPI.__ResetDependency__('allyCellPathGraphics');
    DrawRewireAPI.__ResetDependency__('getPixiSquare');
    DrawRewireAPI.__ResetDependency__('PPCL');
    t.end();
  });

  tester.test('only adds graphics to background once', t => {
    const mockAddChild = sinon.spy();
    global.tagpro = {
      renderer: {
        layers: {
          background: { addChild: mockAddChild },
        },
      },
    };
    const mockAllyCellPathGraphics = null;
    DrawRewireAPI.__Rewire__('allyCellPathGraphics', mockAllyCellPathGraphics);
    const mockIsVisualMode = sinon.stub().returns(true);
    DrawRewireAPI.__Rewire__('isVisualMode', mockIsVisualMode);
    const mockGetPixiSquare = sinon.spy();
    DrawRewireAPI.__Rewire__('getPixiSquare', mockGetPixiSquare);
    const mockDrawCellPath = sinon.spy();
    DrawRewireAPI.__Rewire__('drawCellPath', mockDrawCellPath);
    const mockRemoveChildren = sinon.spy();
    global.PIXI = { Graphics: class { removeChildren() { mockRemoveChildren(); } } };

    drawAllyCellPath();
    drawAllyCellPath();
    drawAllyCellPath();
    t.is(mockAddChild.callCount, 1); // run only the first time drawAllyCellPath() is called

    DrawRewireAPI.__ResetDependency__('isVisualMode');
    DrawRewireAPI.__ResetDependency__('allyCellPathGraphics');
    DrawRewireAPI.__ResetDependency__('getPixiSquare');
    DrawRewireAPI.__ResetDependency__('drawCellPath');
    global.tagpro = undefined;
    global.PIXI = undefined;
    t.end();
  });

  tester.end();
});


test('clearSprites', tester => {
  tester.test('removes permNTSprites, pathSprites, and tempNTSprites from UI', t => {
    const mockRemoveChild = sinon.spy();
    const mockRemoveChildren = sinon.spy();
    const mockClear = sinon.spy();
    global.tagpro = {
      renderer: {
        layers: {
          background: { removeChild: mockRemoveChild },
          foreground: { removeChild: mockRemoveChild },
        },
      },
    };
    DrawRewireAPI.__Rewire__('keyPressesVis', { removeChildren: mockRemoveChildren });
    DrawRewireAPI.__Rewire__('allyCellPathGraphics', { removeChildren: mockRemoveChildren });
    DrawRewireAPI.__Rewire__('enemyCellPathGraphics', { removeChildren: mockRemoveChildren });
    DrawRewireAPI.__Rewire__('allyPolypointPathGraphics', { clear: mockClear });
    DrawRewireAPI.__Rewire__('enemyPolypointPathGraphics', { clear: mockClear });
    DrawRewireAPI.__Rewire__('tempNTSprites', [[4, null], [null, 5]]);
    clearSprites();

    t.is(mockRemoveChildren.callCount, 3);
    t.is(mockClear.callCount, 2);
    t.is(mockRemoveChild.callCount, 2);
    t.true(mockRemoveChild.calledWithExactly(4));
    t.true(mockRemoveChild.calledWithExactly(5));

    DrawRewireAPI.__ResetDependency__('keyPressesVis');
    DrawRewireAPI.__ResetDependency__('allyCellPathGraphics');
    DrawRewireAPI.__ResetDependency__('enemyCellPathGraphics');
    DrawRewireAPI.__ResetDependency__('allyPolypointPathGraphics');
    DrawRewireAPI.__ResetDependency__('enemyPolypointPathGraphics');
    DrawRewireAPI.__ResetDependency__('tempNTSprites');
    global.tagpro = undefined;
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
    global.tagpro = undefined;
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

    DrawRewireAPI.__ResetDependency__('CPTL');
    t.end();
  });

  tester.test('calls drawRect for CPTL=1', t => {
    const mockDrawRect = sinon.spy();
    global.PIXI = {
      Graphics: class {
        beginFill() {
          return this;
        }
        drawRect() {
          mockDrawRect();
          return this;
        }
      },
    };
    DrawRewireAPI.__Rewire__('CPTL', 1);
    DrawRewireAPI.__Rewire__('PPCL', 40);
    DrawRewireAPI.__Rewire__('permNTSprite', new PIXI.Graphics());
    const traversability = [[1, 0, 1]];

    generatePermanentNTSprites(0, 0, traversability);
    t.false(mockDrawRect.called);

    generatePermanentNTSprites(0, 1, traversability);
    t.is(mockDrawRect.callCount, 1);

    global.PIXI = undefined;
    DrawRewireAPI.__ResetDependency__('CPTL');
    DrawRewireAPI.__ResetDependency__('PPCL');
    DrawRewireAPI.__ResetDependency__('permNTSprite');
    t.end();
  });

  tester.test('calls drawRect for CPTL=2', t => {
    const mockDrawRect = sinon.spy();
    global.PIXI = {
      Graphics: class {
        beginFill() {
          return this;
        }
        drawRect() {
          mockDrawRect();
          return this;
        }
      },
    };
    DrawRewireAPI.__Rewire__('CPTL', 2);
    DrawRewireAPI.__Rewire__('PPCL', 20);
    DrawRewireAPI.__Rewire__('permNTSprite', new PIXI.Graphics());
    const traversability = [[1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1]];

    generatePermanentNTSprites(0, 0, traversability);
    t.false(mockDrawRect.called);

    generatePermanentNTSprites(0, 1, traversability);
    t.is(mockDrawRect.callCount, 2);

    global.PIXI = undefined;
    DrawRewireAPI.__ResetDependency__('CPTL');
    DrawRewireAPI.__ResetDependency__('PPCL');
    DrawRewireAPI.__ResetDependency__('permNTSprite');
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
    global.tagpro = undefined;
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
    const mockGetGraphGraphics = sinon.spy();
    const mockGetDTGraph = sinon.stub().returns(mockGraph);
    DrawRewireAPI.__Rewire__('getGraphGraphics', mockGetGraphGraphics);
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

    t.true(mockGetGraphGraphics.calledWith(mockGraph, 'thick', 'brown', 'morebrown'));

    DrawRewireAPI.__ResetDependency__('drawGraph');
    DrawRewireAPI.__ResetDependency__('getDTGraph');
    DrawRewireAPI.__ResetDependency__('NAV_MESH_THICKNESS');
    DrawRewireAPI.__ResetDependency__('NAV_MESH_EDGE_COLOR');
    DrawRewireAPI.__ResetDependency__('NAV_MESH_VERTEX_COLOR');
    global.tagpro = undefined;
    t.end();
  });

  tester.end();
});
