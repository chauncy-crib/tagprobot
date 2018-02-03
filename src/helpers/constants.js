import { findCachedTile } from './finders';


let currGameIsCenterFlag;

export function setupIsCenterFlag() {
  currGameIsCenterFlag = findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']) !== null;
}

export function isCenterFlag() {
  return currGameIsCenterFlag;
}
