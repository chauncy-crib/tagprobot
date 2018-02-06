import { Point } from './point';


/**
 * Same as a Point, but keeps a reference to its containing triangle for funneling.
 */
export class Polypoint extends Point {
  constructor(x, y, triangle) {
    super(x, y);
    this.t = triangle;
  }
}
