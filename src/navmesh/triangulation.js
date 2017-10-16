import { graphFromTagproMap } from './polygon';

let DTGraph;

/**
 * @param {num} map - array of all vertices
 * @returns {Graph} graph of the triangulation of all the vertices
 */
export function calculateNavMesh(map) {
  const mapGraph = graphFromTagproMap(map);
  DTGraph = mapGraph;
}


export function getDTGraph() {
  return DTGraph;
}
