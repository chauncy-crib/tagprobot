import _cache from './cache.json';

import {
  getMapName,
  getMapAuthor,
} from '../interpret/interpret';

export const cache = _cache;


let cached = false;


export function setCached(b) {
  cached = b;
}


export function isCached() {
  return cached;
}


export function getMapKey() {
  return `${getMapAuthor()}.${getMapName()}`;
}
