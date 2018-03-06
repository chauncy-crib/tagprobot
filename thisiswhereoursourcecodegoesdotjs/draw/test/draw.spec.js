import test from 'tape';
import sinon from 'sinon';

import { clearSprites, __RewireAPI__ as DrawRewireAPI } from '../draw';


test('clearSprites', tester => {
  tester.test('toggles all drawings', t => {
    const mockToggleKeyPressVis = sinon.spy();
    DrawRewireAPI.__Rewire__('toggleKeyPressVis', mockToggleKeyPressVis);
    const mockToggleTriangulationVis = sinon.spy();
    DrawRewireAPI.__Rewire__('toggleTriangulationVis', mockToggleTriangulationVis);
    const mockTogglePolypointVis = sinon.spy();
    DrawRewireAPI.__Rewire__('togglePolypointVis', mockTogglePolypointVis);
    const mockTogglePathVis = sinon.spy();
    DrawRewireAPI.__Rewire__('togglePathVis', mockTogglePathVis);

    clearSprites();
    t.is(mockToggleKeyPressVis.callCount, 1);
    t.is(mockToggleTriangulationVis.callCount, 1);
    t.is(mockTogglePolypointVis.callCount, 1);
    t.is(mockTogglePathVis.callCount, 1);

    DrawRewireAPI.__ResetDependency__('toggleKeyPressVis');
    DrawRewireAPI.__ResetDependency__('toggleTriangulationVis');
    DrawRewireAPI.__ResetDependency__('togglePolypointVis');
    DrawRewireAPI.__ResetDependency__('togglePathVis');
    t.end();
  });
});
