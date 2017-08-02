import sinon from 'sinon';
import test from 'tape';

import drawPlannedPath, { clearRects, drawRects } from '../src/draw/visualizePath';

test('clearRects() calls removeChild for each sprite', t => {
  const mockRemoveChild = sinon.spy();
  global.tagpro = {
    renderer: {
      pathSprites: [1, 2, 3],
      layers: { background: { removeChild: mockRemoveChild } },
    },
  };

  clearRects();

  t.true(mockRemoveChild.calledThrice);
  t.end();
});

test('clearRects() calls addChild for each sprite', t => {
  const mockAddChild = sinon.spy();
  global.tagpro = {
    renderer: {
      pathSprites: [1, 2, 3],
      layers: { background: { addChild: mockAddChild } },
    },
  };

  drawRects();

  t.true(mockAddChild.calledThrice);
  t.end();
});

test('drawPlannedPath() calls the right functions', t => {
  const mockClearRects = sinon.spy();
  const mockCreatePathSprites = sinon.spy();
  const mockDrawRects = sinon.spy();
  drawPlannedPath.__Rewire__('clearRects', mockClearRects);
  drawPlannedPath.__Rewire__('createPathSprites', mockCreatePathSprites);
  drawPlannedPath.__Rewire__('drawRects', mockDrawRects);

  drawPlannedPath('path', 'cpt', 'hexColor', 'alpha');

  t.true(mockClearRects.calledOnce);
  t.true(mockCreatePathSprites.calledWith('path', 'cpt', 'hexColor', 'alpha'));
  t.true(mockDrawRects.calledOnce);

  drawPlannedPath.__ResetDependency__('clearRects');
  drawPlannedPath.__ResetDependency__('createPathSprites');
  drawPlannedPath.__ResetDependency__('drawRects');
  t.end();
});
