import _ from 'lodash';
import work from 'webworkify-webpack';

import { PolypointState } from './class/PolypointState';
import { getPortals } from './portals';


const funnelWorker = work(require.resolve('./funnel.worker.js'));
let currentFunnelledPath = null;
let loading = false;


funnelWorker.addEventListener('message', ev => {
  if (ev.data.text === 'DONE') {
    currentFunnelledPath = _.map(JSON.parse(ev.data.funnelledPath), stateObj => (
      (new PolypointState()).fromObject(stateObj)
    ));
    loading = false;
  }
});


/**
 * @param {PolypointState[]} path
 * @param {TriangleGraph} triangleGraph
 * @returns {PolypointState[]} a list of states, starting from the startState to the targetState
 *   that are funnelled to be as straight as possible
 */
export function funnelPolypoints(path, triangleGraph) {
  // Don't bother funnelling if our path has no intermediate polypoints, or the path is null
  if (!path || path.length <= 2) return path;

  if (!loading) {
    loading = true;
    const allPortalPoints = getPortals(path, triangleGraph);
    funnelWorker.postMessage({ text: 'FUNNEL_PATH', path, allPortalPoints });
  }

  // Force the first point in the funnelledPath to be our current position even if we use an old
  //   funnelledPath
  if (currentFunnelledPath) [currentFunnelledPath[0]] = path;
  return currentFunnelledPath;
}
