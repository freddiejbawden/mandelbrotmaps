class JSRenderer {
  constructor(pixelSize, width, height, centreCoords, maxIter) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.maxIter = (maxIter) || 200;
  }

  update(pixelSize, width, height, centreCoords, maxIter) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.maxIter = maxIter;
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

  calculatePixelNum(x, y) {
    return y * this.width + x;
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

  renderRow(y, xStart, xEnd) {
    const row = [];
    const colorScale = 255 / this.maxIter;
    for (let x = xStart; x < xEnd; x += 1) {
      const i = this.calculatePixelNum(x, y);
      const iter = this.escapeAlgorithm(i) * colorScale;
      row.push(iter); // R value
      row.push(iter);
      row.push(iter);// B value
      row.push(255); // A value
    }
    return row;
  }

  renderRange(xRect, yRect, dX, dY, oldArr, startRow, endRow) {
    try {
      this.calculateFractalLimit();
      const startingPixelNum = this.calculatePixelNum(0, startRow);
      const newArr = new Uint8ClampedArray((endRow - startRow) * this.width * 4);
      let xStart;
      let xEnd;
      if (dX > 0) {
        xStart = xRect.l + xRect.w;
        xEnd = this.width;
      } else {
        xStart = 0;
        xEnd = this.width - xRect.w;
      }
      for (let y = startRow; y < endRow; y += 1) {
        // render xRect
        const offset = this.calculatePixelNum(0, y) - startingPixelNum;
        if (y >= yRect.t && y < (yRect.t + yRect.h)) {
          console.log('b');
          const row = this.renderRow(y, 0, this.width);
          newArr.set(row, offset * 4);
        } else {
          const reRenderedRow = this.renderRow(y, xRect.l, xRect.l + xRect.w);
          newArr.set(reRenderedRow, (offset + xRect.l) * 4);
          const startNum = this.calculatePixelNum(xStart, y) - startingPixelNum;
          const oldArrStart = ((y - dY) * this.width) + (xStart - dX);
          const oldArrEnd = ((y - dY) * this.width) + (xEnd - dX);
          const toCopy = oldArr.slice(oldArrStart * 4, oldArrEnd * 4);
          newArr.set(toCopy, startNum * 4);
        }
      }
      return {
        arr: newArr,
        width: this.width,
        height: this.height,
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Err: ${err}`);
      return [];
    }
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

export default JSRenderer;
