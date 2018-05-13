import _ from 'lodash';

import { Point } from '../global/class/Point';
import { PolypointState } from './class/PolypointState';
import { funnelPolypointsFromPortals } from './funnel';


export default function worker(self) {
  self.addEventListener('message', ev => {
    if (ev.data.text === 'FUNNEL_PATH') {
      const path = _.map(ev.data.path, stateObj => (new PolypointState()).fromObject(stateObj));
      const allPortalPoints = _.map(ev.data.allPortalPoints, pointArray => (
        _.map(pointArray, pointObj => ((new Point()).fromObject(pointObj)))
      ));

      const funnelledPath = funnelPolypointsFromPortals(path, allPortalPoints);
      self.postMessage({
        text: 'DONE',
        funnelledPath: JSON.stringify(funnelledPath),
        type: ev.data.type,
      });
    }
  });
}
