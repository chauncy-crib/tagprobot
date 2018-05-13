import _ from 'lodash';
import work from 'webworkify-webpack';

import { assert } from '../global/utils';
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
    const { type } = data;
    assert(type === 'ME' || type === 'ENEMY', `invalid path type ${type}`);
    storedFunnelledPaths[type] = funnelledPath;
    loading[type] = false;
  }
});


/**
 * @param {PolypointState[]} path
 * @param {TriangleGraph} triangleGraph
 * @param {'ME'|'ENEMY'} type which path to use
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelPolypoints(path, triangleGraph, type) {
  assert(type === 'ME' || type === 'ENEMY', `invalid path type ${type}`);

  // Don't bother funnelling if our path has no intermediate polypoints, or the path is null
  if (!path || path.length <= 2) return path;

  if (!loading[type]) {
    loading[type] = true;
    const allPortalPoints = getPortals(path, triangleGraph);
    funnelWorker.postMessage({ text: 'FUNNEL_PATH', path, allPortalPoints, type });
  }

  // Force the first point in the funnelledPath to be our current position even if we use an old
  //   funnelledPath
  if (storedFunnelledPaths[type]) storedFunnelledPaths[type][0] = path[0];
  return storedFunnelledPaths[type];
}
