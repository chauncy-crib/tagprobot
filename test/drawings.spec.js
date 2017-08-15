import test from 'tape';
import sinon from 'sinon';

import { updatePath, __RewireAPI__ as DrawRewireAPI } from '../src/draw/drawings';


test('updatePath', tester => {

  tester.test('checks areVisualsOn', t => {
    const mockAreVisualsOn = sinon.stub().returns(false);
    DrawRewireAPI.__Rewire__('areVisualsOn', mockAreVisualsOn);
    updatePath();
    t.true(mockAreVisualsOn.calledOnce);
    t.end();
  });

  tester.test('calls removeChild on each existing sprite', t => {
    const mockAreVisualsOn = sinon.stub().returns(true);
    const mockRemoveChild = sinon.spy();
    const mockPathSprites = ['sprite1', 'sprite2', 'sprite3'];
    global.tagpro = { renderer: { layers: { background:
      { removeChild: mockRemoveChild, addChild: () => {} } } } };
    DrawRewireAPI.__Rewire__('areVisualsOn', mockAreVisualsOn);
    DrawRewireAPI.__Rewire__('pathSprites', mockPathSprites);
    updatePath();
    t.ok(mockRemoveChild.calledThrice);
    t.ok(mockRemoveChild.getCall(0).calledWithExactly('sprite1'));
    t.ok(mockRemoveChild.getCall(1).calledWithExactly('sprite2'));
    t.ok(mockRemoveChild.getCall(2).calledWithExactly('sprite3'));
    DrawRewireAPI.__ResetDependency__('areVisualsOn');
    DrawRewireAPI.__ResetDependency__('pathSprites');
    t.end();
  });

  tester.test('adds a new sprite for each item in path to the renderer', t => {
    const mockAreVisualsOn = sinon.stub().returns(true);
    const mockAddChild = sinon.spy();
    const mockPathSprites = ['potato', 'banana'];
    const mockGetRect = sinon.stub();
    mockGetRect.onCall(0).returns('rect1');
    mockGetRect.onCall(1).returns('rect2');
    global.tagpro = { renderer: { layers: { background:
      { removeChild: () => {}, addChild: mockAddChild } } } };
    DrawRewireAPI.__Rewire__('areVisualsOn', mockAreVisualsOn);
    DrawRewireAPI.__Rewire__('pathSprites', mockPathSprites);
    DrawRewireAPI.__Rewire__('getRect', mockGetRect);
    DrawRewireAPI.__Rewire__('PPCL', 1);
    updatePath([
      { x: 0, y: 1 },
      { x: 2, y: 3 },
    ]);
    t.ok(mockGetRect.calledTwice);
    t.ok(mockAddChild.calledTwice);
    t.ok(mockGetRect.getCall(0).calledWith(0, 1));
    t.ok(mockGetRect.getCall(1).calledWith(2, 3));
    t.ok(mockAddChild.getCall(0).calledWith('rect1'));
    t.ok(mockAddChild.getCall(1).calledWith('rect2'));
    t.same(mockPathSprites, ['rect1', 'rect2']);
    DrawRewireAPI.__ResetDependency__('areVisualsOn');
    DrawRewireAPI.__ResetDependency__('pathSprites');
    DrawRewireAPI.__ResetDependency__('getRect');
    DrawRewireAPI.__ResetDependency__('PPCL');
    t.end();
  });

  tester.end();
});
