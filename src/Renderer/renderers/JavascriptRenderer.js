class MandelbrotRenderer {
  constructor(pixelSize, width, height, centreCoords, maxIter) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.maxIter = (maxIter) || 200;
  }

  pixelsToCoord(x, y) {
    const coordX = this.fractalLimitX + this.pixelSize * x;
    const coordY = this.fractalLimitY + this.pixelSize * y;
    return [coordX, coordY];
  }

  calculatePosition(pixelNum) {
    const x = (pixelNum % this.width);
    const y = Math.floor((pixelNum / this.width));
    return [x, y];
  }

  escapeAlgorithm(pixelNum) {
    const pixelPos = this.calculatePosition(pixelNum);
    const fractalPos = this.pixelsToCoord(...pixelPos);
    let x = 0;
    let y = 0;
    let i = 0;
    while (x * x + y * y < 4 && i < this.maxIter) {
      const xtemp = x * x - y * y + fractalPos[0];
      y = 2 * x * y + fractalPos[1];
      x = xtemp;
      i += 1;
    }
    return (i);
  }

  calculateFractalLimit() {
    this.fractalLimitX = this.centreCoords[0] - (this.width / 2) * this.pixelSize;
    this.fractalLimitY = this.centreCoords[1] - (this.height / 2) * this.pixelSize;
  }

  renderRange(xRect, yRect, dX, dY, arr) {
    this.calculateFractalLimit();
    const colorScale = 255 / this.maxIter;
    const newArr = new Uint8ClampedArray(this.width * this.height * 4);
    for (let i = 0; i < newArr.length; i += 4) {
      const coords = this.calculatePosition(i / 4);
      if (
        (xRect && xRect.pointInBounds(coords[0], coords[1]))
          || (yRect && yRect.pointInBounds(coords[0], coords[1]))) {
        const iter = this.escapeAlgorithm(i / 4) * colorScale;

        newArr[i] = iter; // R value
        newArr[i + 1] = iter; // G value
        newArr[i + 2] = iter; // B value
        newArr[i + 3] = 255; // A value
      } else {
        // copy
        const oldArrPos = ((coords[1] - dY) * this.width) + (coords[0] - dX);
        newArr[i] = arr[oldArrPos * 4]; // R value
        newArr[i + 1] = arr[oldArrPos * 4 + 1]; // G value
        newArr[i + 2] = arr[oldArrPos * 4 + 2]; // B value
        newArr[i + 3] = 255; // A value
      }
    }
    return newArr;
  }

  render() {
    this.calculateFractalLimit();
    const arr = new Uint8ClampedArray(this.width * this.height * 4);
    // Iterate through every pixel
    const colorScale = 255 / this.maxIter;
    for (let i = 0; i < arr.length; i += 4) {
      const iter = this.escapeAlgorithm(i / 4) * colorScale;
      arr[i] = iter; // R value
      arr[i + 1] = iter; // G value
      arr[i + 2] = iter; // B value
      arr[i + 3] = 255; // A value
    }
    return {
      arr,
      width: this.width,
      height: this.height,
    };
  }
}

export default MandelbrotRenderer;
