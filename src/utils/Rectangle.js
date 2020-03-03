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

  // Adapted from https://www.geeksforgeeks.org/find-two-rectangles-overlap/
  overlap(otherRect) {
    if (this.l > otherRect.l + otherRect.w || otherRect.l > this.l + this.w) {
      return false;
    }
    if (this.t > otherRect.t + otherRect.h || otherRect.t > this.t + this.h) {
      return false;
    }
    return true;
  }

  getWidth() {
    return this.w;
  }

  getHeight() {
    return this.h;
  }

  getLeft() {
    return this.l;
  }

  getTop() {
    return this.t;
  }
}
export default Rectangle;
