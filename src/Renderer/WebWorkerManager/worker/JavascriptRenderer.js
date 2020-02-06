/* eslint-disable prefer-destructuring */
import FractalType from '../../../utils/FractalType';
import RendererColors from './RendererColors';
import interpolate from './interpolate';

class JSRenderer {
  constructor(type, pixelSize, width, height, centreCoords, maxIter, juliaPoint) {
    this.type = type;
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.maxIter = (maxIter) || 200;
    this.juliaPoint = juliaPoint || [0, 0];
    this.startColor = [34, 193, 195];
    this.endColor = [49, 45, 253];
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
    let fractalPos;
    let x = 0;
    let y = 0;
    let i = 0;
    const pixelPos = this.calculatePosition(pixelNum);
    if (this.type === FractalType.MANDELBROT) {
      fractalPos = this.pixelsToCoord(...pixelPos);
    } else {
      const startingPos = this.pixelsToCoord(...pixelPos);
      x = startingPos[0];
      y = startingPos[1];
      fractalPos = this.juliaPoint;
    }
    this.maxIter = Math.ceil(this.maxIter);
    while (x * x + y * y < 1000 && i < this.maxIter) {
      const xtemp = x * x - y * y + fractalPos[0];
      y = 2 * x * y + fractalPos[1];
      x = xtemp;
      i += 1;
    }
    if (i === this.maxIter) {
      return -1;
    }

    const q = i - 1 - Math.log2(Math.log2(x * x + y * y)) + 4;
    return q;
  }

  calculateFractalLimit() {
    this.fractalLimitX = this.centreCoords[0] - (this.width / 2) * this.pixelSize;
    this.fractalLimitY = this.centreCoords[1] - (this.height / 2) * this.pixelSize;
  }

  renderRow(y, xStart, xEnd, showRenderTrace, wid, lowRes) {
    const row = [];
    const c = RendererColors[wid % RendererColors.length];
    const colormap = c.map((x) => Math.abs((x / 4) * 3));
    let setColor = (i, val) => {
      const factor = (lowRes) ? this.maxIter * 2 : this.maxIter;
      return Math.ceil(interpolate(this.startColor[i], this.endColor[i], val / factor));
    };
    if (showRenderTrace) {
      setColor = (i, iter) => colormap[i] + iter / 4;
    }
    const colorScale = 255 / this.maxIter;
    for (let x = xStart; x < xEnd; x += 1) {
      const i = this.calculatePixelNum(x, y);
      const iter = this.escapeAlgorithm(i) * colorScale;
      for (let j = 0; j < 3; j += 1) {
        row.push(setColor(j, iter)); // R value
      }
      row.push(255); // A value
    }
    return row;
  }

  renderRange(xRect, yRect, dX, dY, oldArr, startRow, endRow, showRenderTrace, wid) {
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
          const row = this.renderRow(y, 0, this.width, showRenderTrace, wid);
          newArr.set(row, offset * 4);
        } else {
          const reRenderedRow = this.renderRow(y, xRect.l, xRect.l + xRect.w, showRenderTrace, wid);
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

  render(wid, startPixel, endPixel, arrSize, showRenderTrace, lowRes) {
    this.calculateFractalLimit();
    const arr = new Uint8ClampedArray(arrSize);
    // Iterate through every pixel
    const c = RendererColors[wid % RendererColors.length];
    const colormap = c.map((x) => (x / 4) * 3);
    console.log(lowRes);
    let setColor = (i, val) => {
      const factor = (lowRes) ? this.maxIter * 2 : this.maxIter;
      return Math.ceil(interpolate(this.startColor[i], this.endColor[i], val / factor));
    };
    if (showRenderTrace) {
      setColor = (i, iter) => colormap[i] + iter / 4;
    }
    const colorScale = 255.0 / this.maxIter;
    this.calculateFractalLimit();
    for (let i = 0; i <= endPixel * 4 - startPixel * 4; i += 4) {
      const iter = this.escapeAlgorithm((i / 4) + startPixel) * colorScale;
      for (let j = 0; j < 3; j += 1) {
        arr[i + j] = setColor(j, iter);
      }
      arr[i + 3] = 255;
    }
    return arr;
  }
}

export default JSRenderer;
