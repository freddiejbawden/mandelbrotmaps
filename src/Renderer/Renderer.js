import Mode from './RenderMode';
import WebWorkerManager from './WebWorkerManager';
import RendererType from './RendererType';
import FractalType from '../utils/FractalType';

class Renderer {
  /**
   * Constructor for the renderer
   * @param {FractalType} type the type of fractal being rendered
   * @param {RenderMode} renderMethod the render method to use to draw the fractal
   * @param {int} width width of image in pixels
   * @param {int} height height of image in pixels
   * @param {int} maxIter maximum number of iterations
   * @param {Array} juliaPoint array containing x and y coordinates
   * @param {ColorOptions} coloringMode the coloring function to use when rendering
   * @param {*} nChunks the number of chunks to split the image into
   */
  constructor(type, renderMethod, width, height, maxIter, juliaPoint, coloringMode, nChunks) {
    this.mode = renderMethod;
    this.basePixelSize = (type === FractalType.MANDELBROT) ? 0.05 : 0.05;
    this.maximumPixelSize = this.basePixelSize * 4;
    this.pixelSize = this.basePixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = [0, 0];
    this.maxIter = parseInt(maxIter, 10);
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.timer = undefined;
    this.juliaPoint = juliaPoint;
    this.webWorkerManager = new WebWorkerManager(
      type,
      nChunks,
    );
    this.mtTimer = undefined;
    this.prev_arr = undefined;
    this.showRenderTrace = false;
    this.coloringMode = coloringMode;
  }
  /**
   * Calcualte the corner of a bounding box for the fractal limits
   */
  // eslint-disable-next-line lines-between-class-members
  calculateFractalLimit() {
    const fractalLimitX = this.centreCoords[0] - (this.width / 2) * this.pixelSize;
    const fractalLimitY = this.centreCoords[1] - (this.height / 2) * this.pixelSize;
    return { fractalLimitX, fractalLimitY };
  }

  /**
   * Calculate the new fractal position
   * @param {*} canvasZoom The amount of zoom on the canvas
   * @param {*} pixX anchor point
   * @param {*} pixY anchor point
   */
  /* Adapted from https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate */
  async zoomOnPoint(canvasZoom, pixX, pixY) {
    const newPixelSize = this.pixelSize / canvasZoom;
    const newFractalLimitX = this.centreCoords[0] - (this.width / 2) * newPixelSize;
    const newFractalLimitY = this.centreCoords[1] - (this.height / 2) * newPixelSize;
    // calculate the pixel pos in the new zoom level
    const newX = newFractalLimitX + pixX * newPixelSize;
    const newY = newFractalLimitY + pixY * newPixelSize;

    const oldFractalLimitX = this.centreCoords[0] - (this.width / 2) * this.pixelSize;
    const oldFractalLimitY = this.centreCoords[1] - (this.height / 2) * this.pixelSize;

    const oldX = oldFractalLimitX + pixX * this.pixelSize;
    const oldY = oldFractalLimitY + pixY * this.pixelSize;
    this.centreCoords[0] += -1 * (newX - oldX);
    this.centreCoords[1] += -1 * (newY - oldY);
    this.pixelSize = newPixelSize;
  }

  /**
   * Perform a partial render of the current fractal, the new area is
   * made up of a horizontal and vertical rectangle
   * @param {*} xRect the horizontal rectangle to render
   * @param {*} yRect the vertical rectangle to render
   * @param {*} dX the X offset of the image
   * @param {*} dY the Y offset of the image
   */
  async renderRange(xRect, yRect, dX, dY) {
    if (this.mode === Mode.JAVASCRIPT) {
      const useSingleThread = true;
      const fractal = await this.webWorkerManager.renderRange(
        this.pixelSize,
        this.width,
        this.height,
        this.centreCoords,
        this.maxIter,
        this.prev_arr,
        xRect,
        yRect,
        dX,
        dY,
        this.juliaPoint,
        useSingleThread,
        RendererType.JAVASCRIPT,
        this.showRenderTrace,
        this.coloringMode,
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    if (this.mode === Mode.WASM) {
      const clamped = new Uint8ClampedArray(this.prev_arr);
      const useSingleThread = true;
      const fractal = await this.webWorkerManager.renderRange(
        this.pixelSize,
        this.width,
        this.height,
        this.centreCoords,
        this.maxIter,
        clamped,
        xRect,
        yRect,
        dX,
        dY,
        this.juliaPoint,
        useSingleThread,
        RendererType.WASM,
        this.showRenderTrace,
        this.coloringMode,
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    if (this.mode === Mode.JAVASCRIPTMT) {
      const useSingleThread = false;
      const fractal = await this.webWorkerManager.renderRange(
        this.pixelSize,
        this.width,
        this.height,
        this.centreCoords,
        this.maxIter,
        this.prev_arr,
        xRect,
        yRect,
        dX,
        dY,
        this.juliaPoint,
        useSingleThread,
        RendererType.JAVASCRIPT,
        this.showRenderTrace,
        this.coloringMode,
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    if (this.mode === Mode.WASMMT) {
      const useSingleThread = false;
      const clamped = new Uint8ClampedArray(this.prev_arr);
      const fractal = await this.webWorkerManager.renderRange(
        this.pixelSize,
        this.width,
        this.height,
        this.centreCoords,
        this.maxIter,
        clamped,
        xRect,
        yRect,
        dX,
        dY,
        this.juliaPoint,
        useSingleThread,
        RendererType.WASM,
        this.showRenderTrace,
        this.coloringMode,
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    return [];
  }

  /**
   * Render the current fractal
   * @param {*} maxIter maximum iteration count
   * @param {boolean} lowRes low iteration pass flag
   */
  render(maxIter, lowRes) {
    this.maxIter = maxIter;
    // eslint-disable-next-line no-async-promise-executor
    const renderPromise = new Promise(async (resolve, reject) => {
      if (this.mode === Mode.JAVASCRIPT) {
        const useSingleThread = true;
        this.webWorkerManager.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
          this.juliaPoint,
          useSingleThread,
          RendererType.JAVASCRIPT,
          this.showRenderTrace,
          lowRes,
          this.coloringMode,
        ).then((fractal) => {
          this.prev_arr = fractal.arr;
          resolve(fractal);
        }).catch((e) => reject(e));
      } else if (this.mode === Mode.WASM) {
        const useSingleThread = true;
        this.webWorkerManager.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
          this.juliaPoint,
          useSingleThread,
          RendererType.WASM,
          false,
          lowRes,
          this.coloringMode,
        ).then((fractal) => {
          this.prev_arr = fractal.arr;
          resolve(fractal);
        });
      } else if (this.mode === Mode.JAVASCRIPTMT) {
        this.webWorkerManager.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
          this.juliaPoint,
          false,
          RendererType.JAVASCRIPT,
          this.showRenderTrace,
          lowRes,
          this.coloringMode,
        ).then((fractal) => {
          this.prev_arr = fractal.arr;
          resolve(fractal);
        }).catch((e) => reject(e));
      } else if (this.mode === Mode.WASMMT) {
        this.webWorkerManager.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
          this.juliaPoint,
          false,
          RendererType.WASM,
          this.showRenderTrace,
          lowRes,
          this.coloringMode,
        ).then((fractal) => {
          this.prev_arr = fractal.arr;
          resolve(fractal);
        });
      } else {
        reject(new Error(`Render Mode ${this.mode} is not valid`));
      }
    });
    return renderPromise;
  }
}
export default Renderer;
