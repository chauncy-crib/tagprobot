import _ from 'lodash';

import { Graph } from '../../interpret/class/Graph';


export class DrawableGraph extends Graph {
  /**
   * @param {number} vertexThickness - radius of the vertices in pixels
   * @param {number} vertexColor - a hex color
   * @param {number} vertexAlpha - an alpha from 0.0-1.0
   */
  constructor(vertexThickness, vertexAlpha, vertexColor) {
    super();
    this.drawingsOn = true;
    this.vertexToDrawingIndex = {}; // map from vertex to its location in the drawing container
    this.indexToVertex = []; // map from index in drawing container to vertex
    this.vertexThickness = vertexThickness;
    this.vertexAlpha = vertexAlpha;
    this.vertexColor = vertexColor;
    this.drawingContainer = new PIXI.DisplayObjectContainer();
    tagpro.renderer.layers.foreground.addChild(this.drawingContainer);
  }

  turnOffDrawings() {
    if (this.drawingsOn) tagpro.renderer.layers.foreground.removeChild(this.drawingContainer);
  }

  turnOnDrawings() {
    if (!this.drawingsOn) tagpro.renderer.layers.foreground.addChild(this.drawingContainer);
  }

  addVertexDrawing(vertex) {
    const vertexDrawing = new PIXI.Graphics();
    vertexDrawing.lineStyle(this.vertexThickness, this.vertexColor, this.vertexAlpha);
    vertexDrawing.drawCircle(vertex.x, vertex.y, this.vertexThickness);
    this.drawingContainer.addChildAt(vertexDrawing, this.indexToVertex.length);
    this.vertexToDrawingIndex[vertex] = this.indexToVertex.length;
    this.indexToVertex.push(vertex);
  }

  removeVertexDrawing(vertex) {
    // The index where the drawing we're removing is
    const drawingIndex = this.vertexToDrawingIndex[vertex];
    // Remove the last drawing from the container
    const lastDrawing = this.drawingContainer.removeChildAt(this.indexToVertex.length - 1);

    // Replace the drawing we're removing with the last drawing
    if (drawingIndex < this.indexToVertex.length - 1) {
      this.drawingContainer.removeChildAt(drawingIndex);
      this.drawingContainer.addChildAt(lastDrawing, drawingIndex);
      // Update data structures accordingly
      this.vertexToDrawingIndex[_.last(this.indexToVertex)] = drawingIndex;
      this.indexToVertex[drawingIndex] = this.indexToVertex.pop();
    } else {
      this.indexToVertex.pop();
    }
    delete this.vertexToDrawingIndex[vertex];
  }

  addVertex(point) {
    if (!super.addVertex(point)) return false;
    this.addVertexDrawing(point);
    return true;
  }

  removeVertex(vertex) {
    if (!super.removeVertex(vertex)) return false;
    this.removeVertexDrawing(vertex);
    return true;
  }
}
