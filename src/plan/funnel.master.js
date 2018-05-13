import _ from 'lodash';
import work from 'webworkify-webpack';

import { PolypointState } from './class/PolypointState';
import { getPortals } from './funnel';


const funnelWorker = work(require.resolve('./funnel.worker.js'));
// Stores the last funnelled paths the worker returned
const storedFunnelledPaths = { ME: null, ENEMY: null };
const loading = { ME: false, ENEMY: false }; // if we are waiting on a response from the worker


funnelWorker.addEventListener('message', ev => {
  const { data } = ev;
  if (data.text === 'DONE') {
    const funnelledPath = _.map(JSON.parse(data.funnelledPath), stateObj => (
      (new PolypointState()).fromObject(stateObj)
    ));
    const { key } = data;
    storedFunnelledPaths[key] = funnelledPath;
    loading[key] = false;
  }
});


/**
 * @param {PolypointState[]} path
 * @param {TriangleGraph} triangleGraph
 * @param {'ME'|'ENEMY'} key which path to use
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
function funnelPolypoints(path, triangleGraph, key) {
  // Don't bother funnelling if our path has no intermediate polypoints, or the path is null
  if (!path || path.length <= 2) return path;

  if (!loading[key]) {
    loading[key] = true;
    const allPortalPoints = getPortals(path, triangleGraph);
    funnelWorker.postMessage({ text: 'FUNNEL_PATH', path, allPortalPoints, key });
  }

  // Force the first point in the funnelledPath to be our current position even if we use an old
  //   funnelledPath
  if (storedFunnelledPaths[key]) storedFunnelledPaths[key][0] = path[0];
  return storedFunnelledPaths[key];
}


/**
 * @param {PolypointState[]} path
 * @param {TriangleGraph} triangleGraph
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelMyPolypoints(path, triangleGraph) {
  return funnelPolypoints(path, triangleGraph, 'ME');
}


/**
 * @param {PolypointState[]} path
 * @param {TriangleGraph} triangleGraph
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelEnemyPolypoints(path, triangleGraph) {
  return funnelPolypoints(path, triangleGraph, 'ENEMY');
}
