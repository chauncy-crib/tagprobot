import _ from 'lodash';
import { assert } from '../global/utils';

export const internalMap = [];

// A list of x, y pairs, which are the locations in the map that might change
export const tilesToUpdate = [];
export const tilesToUpdateValues = []; // the values stored in those locations


let dtGraph;
let unmergedGraph;
let mergedGraph;
let mapName;
let mapAuthor;


export function setDtGraph(d) {
  dtGraph = d;
}


export function setUnmergedGraph(g) {
  unmergedGraph = g;
}


export function setMergedGraph(g) {
  mergedGraph = g;
}


export function setMapName(n) {
  mapName = n;
}


export function setMapAuthor(a) {
  mapAuthor = a;
}


export function setInternalMap(m) {
  assert(_.isEmpty(internalMap), 'internalMap not empty when being set');
  for (let i = 0; i < m.length; i++) internalMap.push(_.clone(m[i]));
}


export function setTilesToUpdate(t) {
  assert(_.isEmpty(tilesToUpdate), 'tilesToUpdate not empty when being set');
  _.forEach(t, xy => tilesToUpdate.push(xy));
}


export function setTilesToUpdateValues(t) {
  assert(_.isEmpty(tilesToUpdateValues), 'tilesToUpdateValues not empty when being set');
  _.forEach(t, v => tilesToUpdateValues.push(v));
}


export function getMergedGraph() {
  return mergedGraph;
}


export function getUnmergedGraph() {
  return unmergedGraph;
}


export function getDTGraph() {
  return dtGraph;
}


export function getMapName() {
  return mapName;
}


export function getMapAuthor() {
  return mapAuthor;
}
