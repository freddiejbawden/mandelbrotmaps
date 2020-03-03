class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  getR() {
    return this.r;
  }

  getG() {
    return this.g;
  }

  getB() {
    return this.b;
  }

  getArr() {
    return [this.r, this.g, this.b];
  }
}

// eslint-disable-next-line import/prefer-default-export
export { Color };
