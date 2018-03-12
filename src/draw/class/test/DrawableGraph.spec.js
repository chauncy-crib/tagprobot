import sinon from 'sinon';


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
  return { addChildSpy, addChildAtSpy };
}


export function resetPixiAndTagpro() {
  global.PIXI = undefined;
  global.tagpro = undefined;
}
