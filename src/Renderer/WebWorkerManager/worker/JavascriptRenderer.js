/* eslint-disable prefer-destructuring */
import FractalType from '../../../utils/FractalType';
import RendererColors from './RendererColors';
import interpolate from './interpolate';
import { Color } from '../../../utils/Color';
import ColorMode from '../../ColorOptions';

class JSRenderer {
  /**
   * Constructor for an instance of Javascript Renderer
   * @param {*} pixelSize the size of the world space that one pixel represents
   * @param {*} width the width of the fractal in pixels
   * @param {*} height the height of the fractal in pixels
   * @param {*} centreCoords world space centre coordinates
   * @param {*} maxIter the iteration limit
   * @param {*} juliaPoint x and y point of the julia point
   * @param {FractalType} type the type of fractal to render
   * @param {ColorOptions} coloringMethod the coloring method to use
   */
  constructor(type, pixelSize, width, height, centreCoords, maxIter, juliaPoint, coloringMethod) {
    this.type = type;
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.maxIter = (maxIter) || 200;
    this.juliaPoint = juliaPoint || [0, 0];
    this.startColor = new Color(0, 0, 0);
    this.endColor = new Color(255, 255, 255);
    this.colormap = RendererColors.map((x) => (x.map((el) => (el / 4))));
    this.coloringMethod = coloringMethod || 0;
  }

  /**
   * Return the rainbow color based on iterations
   * @param {*} iter
   */
  // eslint-disable-next-line class-methods-use-this
  getRainbow(iter) {
    if (iter === -1) {
      return 0;
    }
    const red = Math.sin(0.3 * iter) * 127 + 128;
    const green = Math.sin(0.3 * iter + 2) * 127 + 128;
    const blue = Math.sin(0.3 * iter + 4) * 127 + 128;

    return [
      red,
      green,
      blue,
    ];
  }

  /**
   * Set color of a pixel
   * @param {*} i the index to set
   * @param {*} val the value to put
   * @param {*} showRenderTrace whether to tint the renderer
   * @param {*} wid worker id
   */
  setColor(i, val, showRenderTrace, wid) {
    if (showRenderTrace) {
      // tint color based on which worker it came from
      return this.colormap[wid][i] + (val / 4) * 3;
    }
    if (val === -2) {
      return [0, 0, 0];
    }

    if (this.coloringMethod === ColorMode.BLACKANDWHITE) {
      return interpolate(
        0,
        255,
        val / this.maxIter,
      );
    } if (this.coloringMethod === ColorMode.RAINBOW) {
      return this.getRainbow(val)[i];
    } if (this.coloringMethod === ColorMode.STRIPES) {
      return interpolate(
        0,
        255,
        (1 + Math.cos(2 * Math.PI * val)) / 2,
      );
    }

    return interpolate(
      this.startColor.getArr()[i],
      this.endColor.getArr()[i],
      val / this.maxIter,
    );
  }

  /**
   * Convert the pixel position to the world position
   * @param {*} x pixel X
   * @param {*} y pixel Y
   */
  pixelsToCoord(x, y) {
    const coordX = this.fractalLimitX + this.pixelSize * x;
    const coordY = this.fractalLimitY + this.pixelSize * y;
    return [coordX, coordY];
  }

  /**
   * Calculate the x,y pixel position from a 1D index
   * @param {*} pixelNum 1D index
   */
  calculatePosition(pixelNum) {
    const x = (pixelNum % this.width);
    const y = Math.floor((pixelNum / this.width));
    return [x, y];
  }

  /**
   * Find the pixel number from x,y, pixels
   * @param {*} x x pixel
   * @param {*} y y pixel
   */
  calculatePixelNum(x, y) {
    return y * this.width + x;
  }

  /**
   * Perform the escape algorithm for a point
   * @param {*} pixelNum index in the image array to render
   */
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
    // slightly raised to make the outside area more smooth
    while (x * x + y * y < 10 && i < this.maxIter) {
      const xtemp = x * x - y * y + fractalPos[0];
      y = 2 * x * y + fractalPos[1];
      x = xtemp;
      i += 1;
    }
    if (i === this.maxIter) {
      return -1;
    }
    // smooth the iteration count
    const q = (i - 1) - Math.log2(Math.log2(x * x + y * y)) + 4;
    return q;
  }

  /**
   * Update the fractal limit
   */
  calculateFractalLimit() {
    this.fractalLimitX = this.centreCoords[0] - (this.width / 2) * this.pixelSize;
    this.fractalLimitY = this.centreCoords[1] - (this.height / 2) * this.pixelSize;
  }

  /**
   * Render a single row
   * @param {*} y row idx
   * @param {*} xStart row start position
   * @param {*} xEnd row end position
   * @param {*} showRenderTrace show the render trace
   * @param {*} wid id of the worker
   */
  renderRow(y, xStart, xEnd, showRenderTrace, wid) {
    const row = [];
    for (let x = xStart; x < xEnd; x += 1) {
      const i = this.calculatePixelNum(x, y);
      const iter = this.escapeAlgorithm(i);
      for (let j = 0; j < 3; j += 1) {
        row.push(this.setColor(j, iter, showRenderTrace, wid)); // R value
      }
      row.push(255); // A value
    }
    return row;
  }

  /**
   * @param {*} xRect the horizontal protion to re-redner
   * @param {*} yRect the vertical portion to re render
   * @param {*} dX the X offset of the image
   * @param {*} dY the Y offset of the image
   * @param {*} oldArr the last image that was rendered
   * @param {*} startRow row to start on
   * @param {*} endRow row to end on
   * @param {*} showRenderTrace show the render trace
   * @param {*} wid id of the worker
   */
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

  /**
   * Render a chunk
   * @param {*} wid worker id
   * @param {*} startPixel start pixel of chunk
   * @param {*} endPixel end pixel of chunk
   * @param {*} arrSize chunk size
   * @param {*} showRenderTrace show trace
   */
  render(wid, startPixel, endPixel, arrSize, showRenderTrace) {
    this.calculateFractalLimit();
    const arr = new Uint8ClampedArray(arrSize);
    // Iterate through every pixel
    this.calculateFractalLimit();
    for (let i = 0; i <= endPixel * 4 - startPixel * 4; i += 4) {
      const iter = this.escapeAlgorithm((i / 4) + startPixel);
      for (let j = 0; j < 3; j += 1) {
        arr[i + j] = this.setColor(j, iter, showRenderTrace, wid);
      }
      arr[i + 3] = 255;
    }
    return arr;
  }
}

export default JSRenderer;
