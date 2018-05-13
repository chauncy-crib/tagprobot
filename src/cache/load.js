import _ from 'lodash';

import { cache, getMapKey, setCached } from './cache';
import { setTilesToUpdate, setTilesToUpdateValues, setInternalMap } from '../interpret/interpret';
import { timeLog } from '../global/timing';

export function loadCache() {
  if (_.has(cache, getMapKey())) {
    const data = cache[getMapKey()];
    setTilesToUpdate(data.tilesToUpdate);
    setTilesToUpdateValues(data.tilesToUpdateValues);
    setInternalMap(data.internalMap);
    setCached(true);
    timeLog('Loaded cache.');
  } else {
    setCached(false);
  }
}
