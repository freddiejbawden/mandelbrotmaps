class JuliaPin {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  isClicked(mouseX, mouseY) {
    console.log(mouseX, this.x, mouseY, this.y);
    if (mouseX > this.x - this.size / 2 && mouseX < this.x + this.size / 2) {
      console.log('pass x');
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

  render(fc) {
    const fractalContext = fc;
    fractalContext.fillStyle = '#ff0000';
    fractalContext.fillRect(this.x - this.size / 2, this.y - this.size / 2, 10, 10);
  }
}

export default JuliaPin;
