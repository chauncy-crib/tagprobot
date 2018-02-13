import test from 'tape';

import { Point } from '../Point';
import { Triangle } from '../Triangle';


test('categorizePoints separates points into shared and unique', t => {
  const p1 = new Point(0, 0);
  const p2 = new Point(-3, 8);
  const p3 = new Point(0, 10);
  const p4 = new Point(40, 40);
  const t1 = new Triangle(p1, p2, p3);
  const t3 = new Triangle(p1, p3, p4);
  const c = t1.categorizePoints(t3);

  t.is(c.shared.length, 2);
  t.is(c.unique.length, 2);

  t.end();
});
