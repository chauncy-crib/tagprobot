import { tileTypes } from '../constants';
import { getMyEndzoneTile } from './player';
import { findTile, findApproxTile } from './map';

// Returns the position of the endzone you should return a the flag to.
// TODO: return closest endzone tile instead of first
export function findMyEndzone() {
  return findTile(getMyEndzoneTile());
}

/*
 * Returns the position (in pixels) of the specified flag station, even if empty.
 */
export function findFlagStation() {
  return findApproxTile(tileTypes.YELLOW_FLAG);
}
