import _ from 'lodash';
import FileSaver from 'file-saver';
import CircularJSON from 'circular-json';

import { cache, getMapKey } from './cache';
import {
  tilesToUpdate,
  tilesToUpdateValues,
  internalMap,
  getUnmergedGraph,
  getMergedGraph,
  getDTGraph,
} from '../interpret/interpret';


export function updateCache() {
  if (!_.has(cache, getMapKey())) {
    const data = {};
    cache[getMapKey()] = data;
    data.tilesToUpdate = tilesToUpdate;
    data.tilesToUpdateValues = tilesToUpdateValues;
    data.internalMap = internalMap;
    data.unmergedGraph = getUnmergedGraph();
    data.mergedGraph = getMergedGraph();
    data.dtGraph = getDTGraph();
    console.log('Data ready');
    const str = CircularJSON.stringify(cache);
    console.log('Done stringify');
    const blob = new Blob([str]);
    FileSaver.saveAs(blob, 'cache_circ.txt');
  }
}
