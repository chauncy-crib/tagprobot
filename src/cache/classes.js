import { Point } from '../global/class/Point';
import { Polypoint } from '../interpret/class/Polypoint';
import { Triangle } from '../interpret/class/Triangle';
import { TriangleGraph } from '../interpret/class/TriangleGraph';
import { Edge } from '../global/class/Edge';
import { Graph } from '../global/class/Graph';
import { Matrix } from '../control/class/Matrix';
import { PolypointState } from '../plan/class/PolypointState';


export function deserializePoint(o) {
  if (o.t) return new Polypoint(o.x, o.y, new Triangle().fromObject(o.t));
  return new Point().fromObject(o);
}


export function deserializeEdge(o) {
  return new Edge().fromObject(o);
}


export function deserializeMatrix(o) {
  return new Matrix().fromObject(o);
}


export function deserializeGraph(o) {
  return new Graph().fromObject(o);
}


export function deserializeTriangleGraph(o) {
  return new TriangleGraph().fromObject(o);
}


export function deserializeTriangle(o) {
  return new Triangle().fromObject(o);
}


export function deserializePolypointState(o) {
  return new PolypointState().fromObject(o);
}
