import { parse } from 'flatted/esm';
import cacheStr from '../../data/cache.txt';
import {
  getMapName,
  getMapAuthor,
} from '../interpret/interpret';
import { getMyColor } from '../look/gameState';

export const cache = parse(cacheStr);


let cached = false;


export function setCached(b) {
  cached = b;
}


/**
 * @returns {boolean} true if the map our bot is playing had a cached representation
 */
export function mapInCache() {
  return cached;
}


export function getMapKey() {
  return `${getMapAuthor()}.${getMapName()}.${getMyColor()}`;
}
