import sinon from 'sinon';


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
