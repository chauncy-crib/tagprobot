import { assert } from '../global/utils';
import { getTileProperty } from '../look/tileInfo';
import { detH, sortCounterClockwise } from './utils';
import {
  internalMap,
  tilesToUpdate,
  tilesToUpdateValues,
  getUnmergedGraph,
  getMergedGraph,
  getDTGraph,
} from './setup';
import {
  updateMergedGraph,
  updateUnmergedGraph,
} from './mapToGraph';
import { redrawNavMesh } from '../draw/triangulation';


/**
 * Given the tagpro map and a tile location which has changed state, update the unmergedGraph,
 *   mergedGraph, and polypointGraph
 */
function updateNavMeshAtLocation(map, xt, yt) {
  updateUnmergedGraph(getUnmergedGraph(), map, xt, yt);
  const { unfixEdges, constrainingEdges, removeVertices, addVertices } =
    updateMergedGraph(getMergedGraph(), getUnmergedGraph(), map, xt, yt);
  getDTGraph().dynamicUpdate(unfixEdges, constrainingEdges, removeVertices, addVertices);
}


/**
 * Looks through the map, checks for tiles that have changed traversability states and updates the
 *   navmesh around those tiles.
 * @param {number} map - 2D array representing the Tagpro map
 */
export function updateAndRedrawEntireNavmesh(map) {
  assert(
    tilesToUpdate.length === tilesToUpdateValues.length,
    'the number of tiles to update and the number of values stored for them are not equal',
  );
  let tileChanged = false;
  for (let i = 0; i < tilesToUpdate.length; i++) {
    const xy = tilesToUpdate[i];
    const tileId = map[xy.xt][xy.yt];
    const tileTraversability = getTileProperty(tileId, 'traversable');
    internalMap[xy.xt][xy.yt] = map[xy.xt][xy.yt];
    // if the traversability of the tile in this location has changed since the last state
    if (tileTraversability !== getTileProperty(tilesToUpdateValues[i], 'traversable')) {
      tileChanged = true;
      tilesToUpdateValues[i] = tileId;
      updateNavMeshAtLocation(internalMap, xy.xt, xy.yt);
    }
  }
  if (tileChanged) redrawNavMesh();
}


/**
 * Checks if edge e is delaunay-legal with respect to the inserted point
 * @param {Point} insertedPoint - the point being added to the triangulation
 * @param {Edge} e - the edge we are checking for legality
 * @param {Point} oppositePoint - The third point of the adjacent triangle to e.p1, e.p2,
 *   insertedPoint
 * @returns {boolean} true if the opposite point is not inside the circle which touches e.p1, e.p2,
 *   insertedPoint
 */
export function isLegal(insertedPoint, e, oppositePoint) {
  const [A, B, C] = sortCounterClockwise([insertedPoint, e.p1, e.p2]);
  const E = oppositePoint;
  return detH(A, B, C, E) <= 0;
}
