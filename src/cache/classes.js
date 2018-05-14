import { Point } from '../global/class/Point';
import { Polypoint } from '../interpret/class/Polypoint';
import { Triangle } from '../interpret/class/Triangle';
import { Edge } from '../global/class/Edge';


export function deserializePoint(o) {
  if (o.t) return new Polypoint(o.x, o.y, (new Triangle()).fromObject(o.t));
  return (new Point()).fromObject(o);
}


export function deserializeEdge(o) {
  return new Edge().fromObject(o);
}
