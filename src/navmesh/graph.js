import _ from 'lodash';

export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Graph {
  constructor() {
    this.vertices = [];
    this.edges = [];
  }

  addEdge(point1, point2) {
    this.edges.push({ point1, point2 });
  }

  /**
   * Return neighbors of the vertex at x, y
   *
   * @returns {Point[]}
   */
  neighbors(x, y) {
    const res = [];
    for (let i = 0; i < this.edges.length; i += 1) {
      const e = this.edges[i];
      if (e.point1.x === x && e.point1.y === y) {
        res.push(e.point2);
      } else if (e.point2.x === x && e.point2.y === y) {
        res.push(e.point1);
      }
    }
    return res;
  }

  addVertex(point) {
    if (_.some(_.map(this.getVertices(), v => v.x === point.x && v.y === point.y))) {
      // vertex already exists
      return;
    }
    this.vertices.push(point);
  }

  /**
   * Gets all vertices in the graph
   *
   * @returns {Point[]}
   */
  getVertices() {
    return this.vertices;
  }

  getEdges() {
    return this.edges;
  }
}
