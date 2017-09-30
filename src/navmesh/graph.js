
export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equal(other) {
    return this.x === other.x && this.y === other.y;
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


  connected(point1, point2) {
    const N = this.neighbors(point1);
    return _.some(_.map(N, n => n.equal(point2)));
  }

  /**
   * Return neighbors of the vertex at x, y
   *
   * @returns {Point[]}
   */
  neighbors(x, y) {
    const res = [];
    const p = Point(x, y);
    for (let i = 0; i < this.edges.length; i += 1) {
      const e = this.edges[i];
      if (e.point1.equal(p)) {
        res.push(e.point2);
      } else if (e.point2.equal(p)) {
        res.push(e.point1);
      }
    }
    return res;
  }

  addVertex(point) {
    if (_.some(_.map(this.getVertices(), v => v.equal(point)))) {
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
