import _ from 'lodash';

import { assert } from '../utils/asserts';
import { getTileProperty } from '../tiles';
import {
  resetTriangulationAndPolypointDrawing,
  drawTriangulation,
  drawPolypoints,
} from '../draw/triangulation';
import { getDTGraph, getMergedGraph, getUnmergedGraph } from '../navmesh/triangulation';
import { updateMergedGraph, updateUnmergedGraph } from '../navmesh/polygon';


// A list of x, y pairs, which are the locations in the map that might change
const tilesToUpdate = [];
const tilesToUpdateValues = []; // the values stored in those locations
const internalMap = [];


export function initInternalMap(map) {
  assert(_.isEmpty(internalMap), 'internalMap not empty when initializing');
  // Modify in place rather than declare with a let
  for (let i = 0; i < map.length; i++) internalMap.push(_.clone(map[i]));
}


/**
 * Parse through each tile in the map and store non-permanent tiles in tilesToUpdate and
 *   tilesToUpdateValues
 * @param {number} map - 2D array representing the Tagpro map
 */
export function setupTilesToUpdate(map) {
  const xtl = map.length;
  const ytl = map[0].length;
  for (let xt = 0; xt < xtl; xt++) {
    for (let yt = 0; yt < ytl; yt++) {
      const tileId = map[xt][yt];
      if (!getTileProperty(tileId, 'permanent')) {
        tilesToUpdate.push({ xt, yt });
        tilesToUpdateValues.push(tileId);
      }
    }
  }
}


/**
 * Given the tagpro map and a tile location which has changed state, update the unmergedGraph,
 *   mergedGraph, and polypointGraph
 */
export function updateNavMesh(map, xt, yt) {
  updateUnmergedGraph(getUnmergedGraph(), map, xt, yt);
  const { unfixEdges, constrainingEdges, removeVertices, addVertices } =
    updateMergedGraph(getMergedGraph(), getUnmergedGraph(), map, xt, yt);
  getDTGraph().dynamicUpdate(unfixEdges, constrainingEdges, removeVertices, addVertices);
}


/**
 * Redraw the triangulation and polypoints
 */
function redrawNavMesh() {
  resetTriangulationAndPolypointDrawing();
  drawTriangulation();
  drawPolypoints();
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
      updateNavMesh(internalMap, xy.xt, xy.yt);
    }
  }
  if (tileChanged) redrawNavMesh();
}
