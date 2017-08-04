import sinon from 'sinon';
import test from 'tape';

import { drawPlannedPath, drawNonTraversableCells, __RewireAPI__ as DrawingRewireAPI } from '../src/draw/drawings';
import { clearSprites, drawSprites } from '../src/draw/utils';

test('clearSprites() calls removeChild for each sprite', t => {
  const mockRemoveChild = sinon.spy();
  global.tagpro = {
    renderer: {
      pathSprites: [1, 2, 3],
      layers: { background: { removeChild: mockRemoveChild } },
    },
  };

  clearSprites(tagpro.renderer.pathSprites);

  t.true(mockRemoveChild.calledThrice);
  t.end();
});

test('clearSprites() calls addChild for each sprite', t => {
  const mockAddChild = sinon.spy();
  global.tagpro = {
    renderer: {
      pathSprites: [1, 2, 3],
      layers: { background: { addChild: mockAddChild } },
    },
  };

  drawSprites(tagpro.renderer.pathSprites);

  t.true(mockAddChild.calledThrice);
  t.end();
});

test('drawPlannedPath() calls the right functions with visualsOn on', t => {
  const mockClearSprites = sinon.spy();
  const mockCreatePathSprites = sinon.spy();
  const mockDrawSprites = sinon.spy();
  let mockVisual = sinon.stub().returns(true);

  DrawingRewireAPI.__Rewire__('clearSprites', mockClearSprites);
  DrawingRewireAPI.__Rewire__('createPathSprites', mockCreatePathSprites);
  DrawingRewireAPI.__Rewire__('drawSprites', mockDrawSprites);
  DrawingRewireAPI.__Rewire__('visualsOn', mockVisual);

  drawPlannedPath('path', 'cpt', 'hexColor', 'alpha');

  t.true(mockVisual.calledOnce);
  t.true(mockClearSprites.calledOnce);
  t.true(mockCreatePathSprites.calledWith('path', 'cpt', 'hexColor', 'alpha'));
  t.true(mockDrawSprites.calledOnce);

  mockVisual = sinon.stub().returns(false);
  DrawingRewireAPI.__Rewire__('visualsOn', mockVisual);
  drawPlannedPath('path', 'cpt', 'hexColor', 'alpha');

  t.true(mockVisual.calledOnce);
  t.true(mockClearSprites.calledTwice);
  t.true(mockCreatePathSprites.calledOnce);
  t.true(mockDrawSprites.calledTwice);

  DrawingRewireAPI.__ResetDependency__('clearSprites');
  DrawingRewireAPI.__ResetDependency__('createPathSprites');
  DrawingRewireAPI.__ResetDependency__('drawSprites');
  t.end();
});

test('drawNonTraversableCells() calls the right functions', t => {
  const mockClearSprites = sinon.spy();
  const mockCreateNonTraversableCellSprites = sinon.spy();
  const mockDrawSprites = sinon.spy();
  let mockVisual = sinon.stub().returns(true);

  DrawingRewireAPI.__Rewire__('clearSprites', mockClearSprites);
  DrawingRewireAPI.__Rewire__('createNonTraversableCellSprites',
    mockCreateNonTraversableCellSprites);
  DrawingRewireAPI.__Rewire__('drawSprites', mockDrawSprites);
  DrawingRewireAPI.__Rewire__('visualsOn', mockVisual);

  drawNonTraversableCells('traversableCells', 'cpt', 'hexColor', 'alpha');

  t.true(mockVisual.calledOnce);
  t.true(mockClearSprites.calledOnce);
  t.true(mockCreateNonTraversableCellSprites.calledWith(
    'traversableCells', 'cpt', 'hexColor', 'alpha'));
  t.true(mockDrawSprites.calledOnce);

  mockVisual = sinon.stub().returns(false);
  DrawingRewireAPI.__Rewire__('visualsOn', mockVisual);
  drawNonTraversableCells('traversableCells', 'cpt', 'hexColor', 'alpha');

  t.true(mockVisual.calledOnce);
  t.true(mockClearSprites.calledTwice);
  t.true(mockCreateNonTraversableCellSprites.calledOnce);
  t.true(mockDrawSprites.calledTwice);

  DrawingRewireAPI.__ResetDependency__('clearSprites');
  DrawingRewireAPI.__ResetDependency__('createPathSprites');
  DrawingRewireAPI.__ResetDependency__('drawSprites');
  DrawingRewireAPI.__ResetDependency__('visualsOn');
  t.end();
});
