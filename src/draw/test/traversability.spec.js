import test from 'tape';
import sinon from 'sinon';

import {
  drawPermanentNTSprites,
  generatePermanentNTSprites,
  updateNTSprites,
  __RewireAPI__ as TraversabilityRewireAPI,
} from '../traversability';


test('drawPermanentNTSprites', tester => {
  tester.test('adds permanent sprites to the renderer', t => {
    const mockAddChild = sinon.spy();
    global.tagpro = { renderer: { layers: { background: { addChild: mockAddChild } } } };
    TraversabilityRewireAPI.__Rewire__('permNTSprite', 'sprite');
    drawPermanentNTSprites();

    t.is(mockAddChild.callCount, 1);
    t.true(mockAddChild.calledWithExactly('sprite'));

    TraversabilityRewireAPI.__ResetDependency__('permNTSprite');
    global.tagpro = undefined;
    t.end();
  });

  tester.end();
});


test('generatePermanentNTSprites', tester => {
  tester.test('throws error when x, y out of bounds', t => {
    TraversabilityRewireAPI.__Rewire__('CPTL', 1);
    t.throws(() => generatePermanentNTSprites(1, 0, [[0, 0, 0]]));
    t.throws(() => generatePermanentNTSprites(0, 1, [[0], [0], [0]]));

    TraversabilityRewireAPI.__Rewire__('CPTL', 2);
    t.throws(() => generatePermanentNTSprites(1, 0, [[0, 0], [0, 0]]));

    TraversabilityRewireAPI.__ResetDependency__('CPTL');
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
    TraversabilityRewireAPI.__Rewire__('CPTL', 1);
    TraversabilityRewireAPI.__Rewire__('PPCL', 40);
    TraversabilityRewireAPI.__Rewire__('permNTSprite', new PIXI.Graphics());
    const traversability = [[1, 0, 1]];

    generatePermanentNTSprites(0, 0, traversability);
    t.false(mockDrawRect.called);

    generatePermanentNTSprites(0, 1, traversability);
    t.is(mockDrawRect.callCount, 1);

    global.PIXI = undefined;
    TraversabilityRewireAPI.__ResetDependency__('CPTL');
    TraversabilityRewireAPI.__ResetDependency__('PPCL');
    TraversabilityRewireAPI.__ResetDependency__('permNTSprite');
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
    TraversabilityRewireAPI.__Rewire__('CPTL', 2);
    TraversabilityRewireAPI.__Rewire__('PPCL', 20);
    TraversabilityRewireAPI.__Rewire__('permNTSprite', new PIXI.Graphics());
    const traversability = [[1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1]];

    generatePermanentNTSprites(0, 0, traversability);
    t.false(mockDrawRect.called);

    generatePermanentNTSprites(0, 1, traversability);
    t.is(mockDrawRect.callCount, 2);

    global.PIXI = undefined;
    TraversabilityRewireAPI.__ResetDependency__('CPTL');
    TraversabilityRewireAPI.__ResetDependency__('PPCL');
    TraversabilityRewireAPI.__ResetDependency__('permNTSprite');
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
    TraversabilityRewireAPI.__Rewire__('CPTL', 2);
    TraversabilityRewireAPI.__Rewire__('PPCL', 20);
    TraversabilityRewireAPI.__Rewire__('getPixiSquare', mockGetPixiSquare);
    TraversabilityRewireAPI.__Rewire__('tempNTSprites', mockTempNTSprites);
    TraversabilityRewireAPI.__Rewire__('traversabilityOn', true);
    updateNTSprites(0, 1, cellTraversabilities);
    updateNTSprites(0, 2, cellTraversabilities);

    t.same(mockTempNTSprites, [
      [null, null, 1, 1, 'square1', null],
      [null, 1, null, 'square2', 1, 'square3'],
    ]);

    TraversabilityRewireAPI.__ResetDependency__('CPTL');
    TraversabilityRewireAPI.__ResetDependency__('PPCL');
    TraversabilityRewireAPI.__ResetDependency__('getPixiSquare');
    TraversabilityRewireAPI.__ResetDependency__('tempNTSprites');
    TraversabilityRewireAPI.__ResetDependency__('traversabilityOn');
    global.tagpro = undefined;
    t.end();
  });

  tester.end();
});
