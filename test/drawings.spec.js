import test from 'tape';
import sinon from 'sinon';

import { updatePath,
  clearSprites,
  drawPermanentNTSprites,
  generatePermanentNTSprites,
  updateNTSprites,
  __RewireAPI__ as DrawRewireAPI } from '../src/draw/drawings';


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
    const mockGetPixiRect = sinon.stub();
    mockGetPixiRect.onCall(0).returns('rect1');
    mockGetPixiRect.onCall(1).returns('rect2');
    global.tagpro = { renderer: { layers: { background:
      { removeChild: () => {}, addChild: mockAddChild } } } };

    DrawRewireAPI.__Rewire__('areVisualsOn', mockAreVisualsOn);
    DrawRewireAPI.__Rewire__('pathSprites', mockPathSprites);
    DrawRewireAPI.__Rewire__('getPixiRect', mockGetPixiRect);
    DrawRewireAPI.__Rewire__('PPCL', 1);

    updatePath([
      { x: 0, y: 1 },
      { x: 2, y: 3 },
    ]);

    t.ok(mockGetPixiRect.calledTwice);
    t.ok(mockAddChild.calledTwice);
    t.ok(mockGetPixiRect.calledWith(0, 1));
    t.ok(mockGetPixiRect.calledWith(2, 3));
    t.ok(mockAddChild.calledWithExactly('rect1'));
    t.ok(mockAddChild.calledWithExactly('rect2'));
    t.same(mockPathSprites, ['rect1', 'rect2']);

    DrawRewireAPI.__ResetDependency__('areVisualsOn');
    DrawRewireAPI.__ResetDependency__('pathSprites');
    DrawRewireAPI.__ResetDependency__('getPixiRect');
    DrawRewireAPI.__ResetDependency__('PPCL');

    t.end();
  });

  tester.end();
});


test('clearSprites', tester => {
  tester.test('removes all sprites in permNTSprites, pathSprites, and tempNTSprites', t => {
    const mockRemoveChild = sinon.spy();
    global.tagpro = { renderer: { layers: { background: { removeChild: mockRemoveChild } } } };

    DrawRewireAPI.__Rewire__('permNTSprites', [1, 2]);
    DrawRewireAPI.__Rewire__('pathSprites', [3, 4]);
    DrawRewireAPI.__Rewire__('tempNTSprites', [[5, null], [null, 6]]);

    clearSprites();

    t.is(mockRemoveChild.callCount, 6);
    t.ok(mockRemoveChild.calledWithExactly(1));
    t.ok(mockRemoveChild.calledWithExactly(2));
    t.ok(mockRemoveChild.calledWithExactly(3));
    t.ok(mockRemoveChild.calledWithExactly(4));
    t.ok(mockRemoveChild.calledWithExactly(5));
    t.ok(mockRemoveChild.calledWithExactly(6));

    DrawRewireAPI.__ResetDependency__('permNTSprites');
    DrawRewireAPI.__ResetDependency__('pathSprites');
    DrawRewireAPI.__ResetDependency__('tempNTSprites');

    t.end();
  });
  tester.end();
});


test('drawPermanentNTSprites', tester => {
  tester.test('adds permanent sprites to the renderer', t => {
    const mockAddChild = sinon.spy();
    global.tagpro = { renderer: { layers: { background: { addChild: mockAddChild } } } };
    DrawRewireAPI.__Rewire__('permNTSprites', ['sprite1', 'sprite2', 'sprite3']);

    drawPermanentNTSprites();

    t.is(mockAddChild.callCount, 3);
    t.ok(mockAddChild.calledWithExactly('sprite1'));
    t.ok(mockAddChild.calledWithExactly('sprite2'));
    t.ok(mockAddChild.calledWithExactly('sprite3'));

    DrawRewireAPI.__ResetDependency__('permNTSprites');

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
    DrawRewireAPI.__Rewire__('CPTL', 2);
    t.end();
  });

  tester.test('stores correct values in permNTSprites and calls getPixiRect for CPTL=1', t => {
    const mockGetPixiRect = sinon.stub();
    const mockPermNTSprites = [];
    mockGetPixiRect.withArgs(0, 40, 40, 40).returns('rect');

    DrawRewireAPI.__Rewire__('permNTSprites', mockPermNTSprites);
    DrawRewireAPI.__Rewire__('getPixiRect', mockGetPixiRect);
    DrawRewireAPI.__Rewire__('CPTL', 1);

    generatePermanentNTSprites(0, 0, [[1, 0, 1]]);
    t.notok(mockGetPixiRect.called);

    generatePermanentNTSprites(0, 1, [[1, 0, 1]]);
    t.ok(mockGetPixiRect.calledOnce);
    t.same(mockPermNTSprites, ['rect']);

    DrawRewireAPI.__ResetDependency__('permNTSprites');
    DrawRewireAPI.__ResetDependency__('getPixiRect');
    DrawRewireAPI.__ResetDependency__('CPTL');

    t.end();
  });

  tester.test('stores correct values in permNTSprites and calls getPixiRect for CPTL=2', t => {
    const mockGetPixiRect = sinon.stub();
    const mockPermNTSprites = [];
    mockGetPixiRect.withArgs(0, 40, 20, 20).returns('rect1');
    mockGetPixiRect.withArgs(20, 40, 20, 20).returns('rect2');
    mockGetPixiRect.withArgs(0, 60, 20, 20).returns('rect3');
    mockGetPixiRect.withArgs(20, 60, 20, 20).returns('rect4');

    DrawRewireAPI.__Rewire__('permNTSprites', mockPermNTSprites);
    DrawRewireAPI.__Rewire__('getPixiRect', mockGetPixiRect);
    DrawRewireAPI.__Rewire__('CPTL', 2);
    DrawRewireAPI.__Rewire__('PPCL', 20);

    generatePermanentNTSprites(0, 0, [[1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1]]);
    t.notok(mockGetPixiRect.called);

    generatePermanentNTSprites(0, 1, [[1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1]]);

    t.ok(mockGetPixiRect.calledTwice);
    t.same(mockPermNTSprites, ['rect1', 'rect4']);

    DrawRewireAPI.__ResetDependency__('permNTSprites');
    DrawRewireAPI.__ResetDependency__('getPixiRect');
    DrawRewireAPI.__ResetDependency__('CPTL');
    DrawRewireAPI.__ResetDependency__('PPCL');

    t.end();
  });
});


test('updateNTSprites', tester => {
  tester.test('adds/deletes the correct sprites from tempNTSprites', t => {
    const mockGetPixiRect = sinon.stub();
    mockGetPixiRect.withArgs(0, 80, 20, 20).returns('rect1');
    mockGetPixiRect.withArgs(20, 60, 20, 20).returns('rect2');
    mockGetPixiRect.withArgs(20, 100, 20, 20).returns('rect3');

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
    global.tagpro = { renderer: { layers: { background: {
      addChild: mockAddChild, removeChild: mockRemoveChild } } } };

    DrawRewireAPI.__Rewire__('CPTL', 2);
    DrawRewireAPI.__Rewire__('PPCL', 20);
    DrawRewireAPI.__Rewire__('getPixiRect', mockGetPixiRect);
    DrawRewireAPI.__Rewire__('tempNTSprites', mockTempNTSprites);

    updateNTSprites(0, 1, cellTraversabilities);
    updateNTSprites(0, 2, cellTraversabilities);

    t.same(mockTempNTSprites, [
      [null, null, 1, 1, 'rect1', null],
      [null, 1, null, 'rect2', 1, 'rect3'],
    ]);

    DrawRewireAPI.__ResetDependency__('CPTL');
    DrawRewireAPI.__ResetDependency__('PPCL');
    DrawRewireAPI.__ResetDependency__('getPixiRect');
    DrawRewireAPI.__ResetDependency__('tempNTSprites');

    t.end();
  });
  tester.end();
});
