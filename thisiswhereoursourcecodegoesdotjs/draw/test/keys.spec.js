import test from 'tape';
import sinon from 'sinon';

import { toggleKeyPressVis, __RewireAPI__ as KeysRewireAPI } from '../keys';


test('toggleKeyPressVis', tester => {
  tester.test('removes children whewn keys are visible', t => {
    KeysRewireAPI.__Rewire__('keyPressOn', true);
    const mockRemoveChildren = sinon.spy();
    KeysRewireAPI.__Rewire__('keyPressesVis', { removeChildren: mockRemoveChildren });

    toggleKeyPressVis();
    t.is(mockRemoveChildren.callCount, 1);

    KeysRewireAPI.__ResetDependency__('keyPressOn');
    KeysRewireAPI.__ResetDependency__('keyPressesVis');
    t.end();
  });

  tester.test('draws blank keys when keys are not visible', t => {
    KeysRewireAPI.__Rewire__('keyPressOn', false);
    const mockDrawBlankKeyPresses = sinon.spy();
    KeysRewireAPI.__Rewire__('drawBlankKeyPresses', mockDrawBlankKeyPresses);

    toggleKeyPressVis();
    t.is(mockDrawBlankKeyPresses.callCount, 1);

    KeysRewireAPI.__ResetDependency__('keyPressOn');
    KeysRewireAPI.__ResetDependency__('keyPressesVis');
    t.end();
  });
});
