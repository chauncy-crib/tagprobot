import math from 'mathjs';


export class Matrix {
  constructor(array) {
    this.array = array;
  }

  dot(other) {
    return math.multiply(this.array, other.array);
  }

  add(other) {
    return math.add(this.array, other.array);
  }

  subtract(other) {
    return math.subtract(this.array, other.array);
  }

  inverse() {
    return math.inv(this.array);
  }
}
