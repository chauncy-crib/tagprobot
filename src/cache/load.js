import _ from 'lodash';

import { cache, getMapKey, setCached } from './cache';
import {
  setTilesToUpdate,
  setTilesToUpdateValues,
  setInternalMap,
  setUnmergedGraph,
  setMergedGraph,
} from '../interpret/interpret';
import { Graph } from '../global/class/Graph';
import { timeLog } from '../global/timing';

export function loadCache() {
  if (_.has(cache, getMapKey())) {
    const data = cache[getMapKey()];
    setTilesToUpdate(data.tilesToUpdate);
    setTilesToUpdateValues(data.tilesToUpdateValues);
    setInternalMap(data.internalMap);
    setUnmergedGraph((new Graph()).fromObject(data.unmergedGraph));
    setMergedGraph((new Graph()).fromObject(data.mergedGraph));
    setCached(true);
    timeLog('Loaded cache.');
  } else {
    setCached(false);
  }
}
