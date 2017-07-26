import test from 'tape';
import * as utils from '../src/utils';


test('test assert', t => {
  let condition = false;
  t.throws(() => { utils.assert(condition); });

  condition = true;
  t.doesNotThrow(() => { utils.assert(condition); });

  t.end();
});
