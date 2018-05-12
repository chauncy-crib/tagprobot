import _cache from '../../data/cache.json';

import {
  getMapName,
  getMapAuthor,
} from '../interpret/interpret';
import { getMyColor } from '../look/gameState';

export const cache = _cache;


let cached = false;


export function setCached(b) {
  cached = b;
}


export function isCached() {
  return cached;
}


export function getMapKey() {
  return `${getMapAuthor()}.${getMapName()}.${getMyColor()}`;
}
