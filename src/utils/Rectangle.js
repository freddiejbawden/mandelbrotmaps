class Rectangle {
  constructor(l, t, w, h) {
    this.t = t;
    this.l = l;
    this.w = w;
    this.h = h;
  }

  pointInBounds(x, y) {
    return (x >= this.l && x <= this.l + this.w && y >= this.t && y <= this.t + this.h);
  }
}
export default Rectangle;
