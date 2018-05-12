import _ from 'lodash';
import FileSaver from 'file-saver';

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
    data.tilesToUpdate = tilesToUpdate;
    data.tilesToUpdateValues = tilesToUpdateValues;
    data.internalMap = internalMap;
    data.unmergedGraph = getUnmergedGraph();
    data.mergedGraph = getMergedGraph();
    data.dtGraph = getDTGraph();
    const oldRoot = getDTGraph().rootNode;
    console.log('converting to non circ');
    data.dtGraph.rootNode = data.dtGraph.rootNode.toNonCirc();
    cache[getMapKey()] = data;
    // const noCirc = CircularJSON.parse(CircularJSON.stringify(cache));
    console.log('json stringify');
    const blob = new Blob([JSON.stringify(cache)]);
    getDTGraph().rootNode = oldRoot;
    FileSaver.saveAs(blob, 'cache.json');
  }
}
