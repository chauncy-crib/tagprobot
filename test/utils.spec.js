import test from 'tape';
import * as utils from '../src/utils';


test('test assert', t => {
  t.plan(2);

  let condition = false;
  t.throws(() => { utils.assert(condition); });

  condition = true;
  t.doesNotThrow(() => { utils.assert(condition); });
});
