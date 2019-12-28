class JuliaPin {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  isClicked(mouseX, mouseY) {
    if (mouseX > this.x - this.size / 2 && mouseX < this.x + this.size / 2) {
      if (mouseY > this.y - this.size / 2 && mouseY < this.y + this.size / 2) {
        return true;
      }
    }
    return false;
  }


  move(x, y) {
    this.x = x;
    this.y = y;
  }

  render(fc, dX, dY) {
    const fractalContext = fc;
    fractalContext.fillStyle = '#ff0000';
    fractalContext.fillRect(this.x - this.size / 2 + dX, this.y - this.size / 2 + dY, 10, 10);
  }
}

export default JuliaPin;
