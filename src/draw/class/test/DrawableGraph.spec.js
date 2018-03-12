
import test from 'tape';
import sinon from 'sinon';

import { DrawableGraph } from '../DrawableGraph';
import { Point } from '../../../interpret/class/Point';


/**
 * Mocks tagpro.renderer.layers.foreground.addChild(), and the PIXI object in order for a
 * DrawableGraph to be initialized during testing
 * @param {Object} directions - directions to draw
 * @param {(string|undefined)} directions.x - either 'RIGHT', 'LEFT', or undefined
 * @param {(string|undefined)} directions.y - either 'DOWN', 'UP', or undefined
 * @returns {{addChildSpy: sinon.spy, addChildAtSpy: sinon.spy, removeChildAtSpy: sinon.spy}} sinon
 *   spies on the tagpro.renderer.layers.foreground.addChild,
 *   PIXI.DisplayObjectContainer.addChildAt, and PIXI.DisplayObjectContainer.removeChildAt
 *   functions.
 */
export function setupPixiAndTagpro() {
  const addChildSpy = sinon.spy();
  const addChildAtSpy = sinon.spy();
  const removeChildAtSpy = sinon.spy();
  /* eslint-disable class-methods-use-this */
  global.PIXI = {
    DisplayObjectContainer: class {
      // Pass arguments to the function to the spy
      addChildAt(...args) { addChildAtSpy(...args); }
      removeChildAt(...args) { removeChildAtSpy(...args); }
    },
    Graphics: class {
      lineStyle() {}
      removeVertex() {}
      drawCircle() {}
    },
  };
  /* eslint-enable class-methods-use-this */
  global.tagpro = { renderer: { layers: { foreground: { addChild: addChildSpy } } } };
  return { addChildSpy, addChildAtSpy, removeChildAtSpy };
}


export function resetPixiAndTagpro() {
  global.PIXI = undefined;
  global.tagpro = undefined;
}


test('DrawableGraph', tester => {
  tester.test('addVertex places drawings at correct indices in container', t => {
    const { addChildSpy, addChildAtSpy } = setupPixiAndTagpro();
    const g = new DrawableGraph();
    t.true(addChildSpy.calledOnce); // constructor should call tagpro.addChild

    g.addVertex(new Point(1, 1));
    t.true(addChildAtSpy.calledOnce);
    t.is(addChildAtSpy.firstCall.args[1], 0); // check the drawing was added in container spot 0

    g.addVertex(new Point(2, 2));
    t.true(addChildAtSpy.calledTwice);
    t.is(addChildAtSpy.secondCall.args[1], 1);

    g.addVertex(new Point(3, 3));
    t.true(addChildAtSpy.calledThrice);
    t.is(addChildAtSpy.thirdCall.args[1], 2);

    g.addVertex(new Point(1, 1));
    t.true(addChildAtSpy.calledThrice); // make sure no duplicate drawings

    resetPixiAndTagpro();
    t.end();
  });

  tester.test('removeVertex replaces the removed vertex with the vertex at the final position in ' +
    'the container', t => {
    const { addChildAtSpy, removeChildAtSpy } = setupPixiAndTagpro();
    const g = new DrawableGraph();
    // Setup graph with three vertices
    g.addVertex(new Point(1, 1));
    g.addVertex(new Point(2, 2));
    g.addVertex(new Point(3, 3));
    g.addVertex(new Point(4, 4));
    g.addVertex(new Point(5, 5));
    t.is(addChildAtSpy.callCount, 5);

    // Removes the last drawing by calling removeChildAt once
    g.removeVertex(new Point(5, 5));
    t.true(removeChildAtSpy.calledOnce);
    t.true(removeChildAtSpy.firstCall.calledWithExactly(4));
    t.is(addChildAtSpy.callCount, 5);

    // Should move the last drawing in the container to replace 2, 2. removeChildAt should be called
    //   twice
    g.removeVertex(new Point(2, 2));
    t.is(addChildAtSpy.callCount, 6);
    t.true(removeChildAtSpy.calledThrice);
    t.true(removeChildAtSpy.secondCall.calledWithExactly(3));
    t.true(removeChildAtSpy.thirdCall.calledWithExactly(1));
    // The last drawing should replace the one we're removing
    t.is(addChildAtSpy.getCall(5).args[1], 1);


    g.removeVertex(new Point(4, 4));
    t.is(addChildAtSpy.callCount, 7);
    t.is(removeChildAtSpy.callCount, 5);
    t.true(removeChildAtSpy.getCall(3).calledWithExactly(2));
    t.true(removeChildAtSpy.getCall(4).calledWithExactly(1));
    t.is(addChildAtSpy.getCall(6).args[1], 1);

    resetPixiAndTagpro();
    t.end();
  });
});
