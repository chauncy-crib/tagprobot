import _ from 'lodash';
import FileSaver from 'file-saver';
import { cache, getMapKey } from './cache';
import { tilesToUpdate, tilesToUpdateValues, internalMap } from '../interpret/interpret';


export function updateCache() {
  if (!_.has(cache, getMapKey())) {
    const data = {};
    data.tilesToUpdate = tilesToUpdate;
    data.tilesToUpdateValues = tilesToUpdateValues;
    data.internalMap = internalMap;
    cache[getMapKey()] = data;
    const blob = new Blob([JSON.stringify(cache)]);
    FileSaver.saveAs(blob, 'cache.json');
  }
}
