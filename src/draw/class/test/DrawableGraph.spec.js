
import test from 'tape';
import sinon from 'sinon';

import { DrawableGraph } from '../DrawableGraph';
import { Point } from '../../../interpret/class/Point';


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
  return { addChildSpy, addChildAtSpy };
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

    global.tagpro = undefined;
    global.PIXI = undefined;
    t.end();
  });
});
