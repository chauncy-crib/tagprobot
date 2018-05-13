import { parse } from 'flatted/esm';
import _cache from '../../data/cache.txt';
import {
  getMapName,
  getMapAuthor,
} from '../interpret/interpret';
import { getMyColor } from '../look/gameState';

export const cache = parse(_cache);


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
