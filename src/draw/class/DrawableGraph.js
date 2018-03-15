import _ from 'lodash';

import { Graph } from '../../interpret/class/Graph';


/**
 * @callback edgeStyleFunc
 * @param {Edge} e
 * @returns {{color: number, alpha: number, thickness: number}} a hex color, alpha, and thickness
 *   that the edge should be colored
 */


export class DrawableGraph extends Graph {
  /**
   * @param {number} vertexThickness - radius of the vertices in pixels
   * @param {number} vertexColor - a hex color
   * @param {number} vertexAlpha - an alpha from 0.0-1.0
   * @param {edgeStyleFunc} getEdgeStyle - a function that returns the color, alpha, and thickness
   *   for each edge.
   */
  constructor(vertexThickness, vertexAlpha, vertexColor, getEdgeStyle) {
    super();
    this.drawingsOn = false;
    this.drawingIndices = {}; // map from vertex/edge to its location in the drawing container
    this.indexToGraphObject = []; // map from index in drawing container to vertex/edge
    this.vertexThickness = vertexThickness;
    this.vertexAlpha = vertexAlpha;
    this.vertexColor = vertexColor;
    this.getEdgeStyle = getEdgeStyle;
    this.drawingContainer = new PIXI.DisplayObjectContainer();
  }

  turnOffDrawings() {
    if (this.drawingsOn) tagpro.renderer.layers.foreground.removeChild(this.drawingContainer);
    this.drawingsOn = false;
  }

  turnOnDrawings() {
    if (!this.drawingsOn) tagpro.renderer.layers.foreground.addChild(this.drawingContainer);
    this.drawingsOn = true;
  }

  addDrawing(drawing, object) {
    this.drawingContainer.addChildAt(drawing, this.indexToGraphObject.length);
    this.drawingIndices[object] = this.indexToGraphObject.length;
    this.indexToGraphObject.push(object);
  }

  removeDrawing(object) {
    // The index where the drawing we're removing is
    const drawingIndex = this.drawingIndices[object];
    // Remove the last drawing from the container
    const lastDrawing = this.drawingContainer.removeChildAt(this.indexToGraphObject.length - 1);

    // Replace the drawing we're removing with the last drawing
    if (drawingIndex < this.indexToGraphObject.length - 1) {
      this.drawingContainer.removeChildAt(drawingIndex);
      this.drawingContainer.addChildAt(lastDrawing, drawingIndex);
      // Update data structures accordingly
      this.drawingIndices[_.last(this.indexToGraphObject)] = drawingIndex;
      this.indexToGraphObject[drawingIndex] = this.indexToGraphObject.pop();
    } else {
      this.indexToGraphObject.pop();
    }
    delete this.drawingIndices[object];
  }

  addVertexDrawing(vertex) {
    const vertexDrawing = new PIXI.Graphics();
    vertexDrawing.lineStyle(this.vertexThickness, this.vertexColor, this.vertexAlpha);
    vertexDrawing.drawCircle(vertex.x, vertex.y, this.vertexThickness);
    this.addDrawing(vertexDrawing, vertex);
  }

  addEdgeDrawing(e) {
    // Make sure e goes from left to right, so that when it gets removed we know what orientation
    //   the key is in
    const edgeDrawing = new PIXI.Graphics();
    const { color, alpha, thickness } = this.getEdgeStyle(e);
    edgeDrawing.lineStyle(thickness, color, alpha);
    edgeDrawing.moveTo(e.p1.x, e.p1.y).lineTo(e.p2.x, e.p2.y);
    this.addDrawing(edgeDrawing, e);
  }

  removeEdgeDrawing(e) {
    this.removeDrawing(e);
  }

  addVertex(point) {
    if (!super.addVertex(point)) return false;
    this.addVertexDrawing(point);
    return true;
  }

  removeVertex(vertex) {
    if (!super.removeVertex(vertex)) return false;
    this.removeDrawing(vertex);
    return true;
  }

  addEdge(edge) {
    if (!super.addEdge(edge)) return false;
    this.addEdgeDrawing(edge);
    return true;
  }

  removeEdge(edge) {
    if (!super.removeEdge(edge)) return false;
    this.removeEdgeDrawing(edge);
    return true;
  }
}
