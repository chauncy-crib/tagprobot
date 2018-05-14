import { Point } from '../global/class/Point';
import { Vector } from '../global/class/Vector';


/**
 * @param {number} x - x position of the base of the arrow shaft
 * @param {number} y - y position of the base of the arrow shaft
 * @param {number} dx - change in x of the arrow
 * @param {number} dy - change in y of the arrow
 * @param {number} [width=10] - width of the arrow head
 * @param {number} [length=5] - length of the arrow head
 * @returns {number[]} an array of alternating x and y values of the points that make up the polygon
 *   of the arrow head shape (formatted like this to match preferred PIXI inputs)
 */
export function getArrowHead(x, y, dx, dy, width = 10, length = 10) {
  if (dx === 0 && dy === 0) return [];
  const base = new Point(x, y);
  const arrow = new Vector(dx, dy);
  const { p1, p2 } = arrow.getPerpendicularEdgeBisectedByTip(width, base);
  const p3 = arrow.getExtensionPoint(length, base);
  return [p1.x, p1.y, p2.x, p2.y, p3.x, p3.y];
}


export function drawArrow(graphics, thickness, color, alpha, x, y, dx, dy) {
  graphics.lineStyle(thickness, color, alpha);
  graphics.beginFill(color, alpha);
  graphics.drawCircle(x, y, 4);
  graphics.drawPolygon(getArrowHead(x, y, dx, dy));
  graphics.endFill();
  graphics.moveTo(x, y).lineTo(x + dx, y + dy);
}
