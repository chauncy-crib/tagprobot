import _ from 'lodash';

import { deserializePoint, deserializePolypointState } from '../cache/classes';
import { funnelPolypointsFromPortals } from './funnel';


export default function worker(self) {
  self.addEventListener('message', ev => {
    if (ev.data.text === 'FUNNEL_PATH') {
      const path = _.map(ev.data.path, stateObj => deserializePolypointState(stateObj));
      const allPortalPoints = _.map(ev.data.allPortalPoints, pointArray => (
        _.map(pointArray, pointObj => deserializePoint(pointObj, false))
      ));

      const funnelledPath = funnelPolypointsFromPortals(path, allPortalPoints);
      self.postMessage({
        text: 'DONE',
        funnelledPath: JSON.stringify(funnelledPath),
        key: ev.data.key,
      });
    }
  });
}
