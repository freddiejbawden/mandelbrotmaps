class JuliaPin {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.collisonBox = size + 20;
  }

  isClicked(mouseX, mouseY) {
    if (mouseX > this.x - this.collisonBox / 2 && mouseX < this.x + this.collisonBox / 2) {
      if (mouseY > this.y - this.collisonBox / 2 && mouseY < this.y + this.collisonBox / 2) {
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
    fractalContext.fillRect(
      this.x + dX - this.size / 4,
      this.y + dY - this.size / 4,
      this.size / 2,
      this.size / 2,
    );
  }
}

export default JuliaPin;
