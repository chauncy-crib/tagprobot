import sinon from 'sinon';
import test from 'tape';

// TODO: uncomment when test below is fixed
// import { drawPlannedPath } from '../src/draw/drawings';
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

test('drawPlannedPath() calls the right functions', t => {
  // TODO: uncomment this test
  // const mockclearSprites = sinon.spy();
  // const mockCreatePathSprites = sinon.spy();
  // const mockdrawSprites = sinon.spy();
  // drawPlannedPath.__Rewire__('clearSprites', mockclearSprites);
  // drawPlannedPath.__Rewire__('createPathSprites', mockCreatePathSprites);
  // drawPlannedPath.__Rewire__('drawSprites', mockdrawSprites);

  // drawPlannedPath('path', 'cpt', 'hexColor', 'alpha');

  // t.true(mockclearSprites.calledOnce);
  // t.true(mockCreatePathSprites.calledWith('path', 'cpt', 'hexColor', 'alpha'));
  // t.true(mockdrawSprites.calledOnce);

  // drawPlannedPath.__ResetDependency__('clearSprites');
  // drawPlannedPath.__ResetDependency__('createPathSprites');
  // drawPlannedPath.__ResetDependency__('drawSprites');
  t.end();
});
