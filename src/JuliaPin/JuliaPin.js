function isDark(colors) {
  // console.log(colors);
  const sum = colors.reduce((x, y) => x + y) / colors.length;
  // console.log(sum);
  return (sum > 255 / 4);
}

class JuliaPin {
  constructor(x, y, size, enabled) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.collisonBox = size + 20;
    this.color = '#ff0000';
    this.enabled = enabled || true;
  }

  isClicked(mouseX, mouseY) {
    if (!this.enabled) return false;
    if (mouseX > this.x - this.collisonBox / 2 && mouseX < this.x + this.collisonBox / 2) {
      if (mouseY > this.y - this.collisonBox / 2 && mouseY < this.y + this.collisonBox / 2) {
        return true;
      }
    }
    return false;
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  move(x, y) {
    this.x = x;
    this.y = y;
  }

  render(fc, dX, dY) {
    const fractalContext = fc;
    const translatedX = this.x + dX;
    const translatedY = this.y + dY;
    const topLeftX = translatedX - this.size / 2;
    const topLeftY = translatedY - this.size / 2;
    try {
      const colors = fractalContext.getImageData(
        topLeftX,
        topLeftY,
        this.size,
        this.size,
      ).data || [255, 0, 0];

      const invertedColors = colors.map((c) => 255 - c);
      const darkArea = isDark(invertedColors);

      // Draw background circle
      fractalContext.fillStyle = (darkArea) ? 'rgba(200,200,200,0.5)' : 'rgba(0,0,0,0.5)';
      fractalContext.beginPath();
      fractalContext.arc(this.x + dX, this.y + dY, this.size, 0, 2 * Math.PI, false);
      fractalContext.fill();

      // Draw solid color circle
      const hex = (darkArea) ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
      fractalContext.fillStyle = hex;
      fractalContext.beginPath();
      fractalContext.arc(this.x + dX, this.y + dY, this.size / 2, 0, 2 * Math.PI, false);
      fractalContext.fill();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}

export default JuliaPin;
