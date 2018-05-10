import { Point } from '../../global/class/Point';
import { Polypoint } from '../../interpret/class/Polypoint';
import { Triangle } from '../../interpret/class/Triangle';
import { PolypointState } from '../class/PolypointState';

export const backwardsFunnelGetClearancePoint = p => {
  if (p.equals(new Point(1400, 320))) return new Point(1419.0918830920368, 300.90811690796323);
  if (p.equals(new Point(1480, 400))) return new Point(1499.0918830920368, 419.09188309203677);
  if (p.equals(new Point(1480, 40))) return new Point(1499.0918830920368, 20.908116907963212);
  return p;
};

export const backwardsFunnelPath = [
  new PolypointState(new Polypoint(
    1458.9999999999998,
    369.99999999999994,
    new Triangle(
      new Point(1400, 320),
      new Point(1480, 400),
      new Point(1480, 40),
    ),
  )),
  new PolypointState(new Polypoint(
    1427,
    360,
    new Triangle(
      new Point(1400, 320),
      new Point(1480, 400),
      new Point(1400, 360),
    ),
  )),
  new PolypointState(new Polypoint(
    1413,
    373,
    new Triangle(
      new Point(1400, 360),
      new Point(1480, 400),
      new Point(1360, 360),
    ),
  )),
  new PolypointState(new Polypoint(
    1360,
    373,
    new Triangle(
      new Point(1240, 360),
      new Point(1480, 400),
      new Point(1360, 360),
    ),
  )),
  new PolypointState(new Polypoint(
    1240,
    387,
    new Triangle(
      new Point(1480, 400),
      new Point(1240, 360),
      new Point(1000, 400),
    ),
  )),
  new PolypointState(new Polypoint(
    1147,
    373,
    new Triangle(
      new Point(1000, 400),
      new Point(1240, 360),
      new Point(1200, 360),
    ),
  )),
  new PolypointState(new Polypoint(
    1133,
    360,
    new Triangle(
      new Point(1000, 400),
      new Point(1200, 320),
      new Point(1200, 360),
    ),
  )),
  new PolypointState(new Polypoint(
    1100,
    340,
    new Triangle(
      new Point(1000, 400),
      new Point(1200, 320),
      new Point(1080, 200),
    ),
  )),
];
