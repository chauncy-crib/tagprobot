import { Graph } from '../../interpret/class/Graph';

export class DrawableGraph extends Graph {
  /**
   * @param {number} vertexThickness - radius of the vertices in pixels
   * @param {number} vertexColor - a hex color
   * @param {number} vertexAlpha - an alpha from 0.0-1.0
   */
  constructor(vertexThickness, vertexAlpha, vertexColor) {
    super();
    this.vertexToDrawingIndex = {}; // map from vertex to its location in the drawing container
    this.indexToVertex = []; // map from index in drawing container to vertex
    this.vertexThickness = vertexThickness;
    this.vertexAlpha = vertexAlpha;
    this.vertexColor = vertexColor;
    this.drawingContainer = new PIXI.DisplayObjectContainer();
    tagpro.renderer.layers.foreground.addChild(this.drawingContainer);
  }

  addVertex(point) {
    return super.addVertex(point);
  }
}
