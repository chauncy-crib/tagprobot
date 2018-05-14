import _ from 'lodash';

import { cache, getMapKey, setCached } from './cache';
import {
  setTilesToUpdate,
  setTilesToUpdateValues,
  setInternalMap,
  setUnmergedGraph,
  setMergedGraph,
  setDtGraph,
  getDTGraph,
} from '../interpret/interpret';
import { timeLog } from '../global/timing';
import { deserializeGraph, deserializeTriangleGraph } from './classes';

export function loadCache() {
  if (_.has(cache, getMapKey())) {
    const data = cache[getMapKey()];
    setTilesToUpdate(data.tilesToUpdate);
    setTilesToUpdateValues(data.tilesToUpdateValues);
    setInternalMap(data.internalMap);
    setUnmergedGraph(deserializeGraph(data.unmergedGraph));
    setMergedGraph(deserializeGraph(data.mergedGraph));
    setDtGraph(deserializeTriangleGraph(data.dtGraph));
    getDTGraph().addAllDrawings();
    getDTGraph().polypoints.addAllDrawings();
    setCached(true);
    timeLog('Loaded cache.');
  } else {
    setCached(false);
  }
}
