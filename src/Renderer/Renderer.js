import Mode from '../utils/RenderMode';
import WebWorkerManager from './WebWorkerManager';
import RendererType from './RendererType';

class Renderer {
  constructor(type, renderMethod, width, height, maxIter, juliaPoint) {
    this.mode = renderMethod;
    this.pixelSize = 0.004;
    this.maximumPixelSize = this.pixelSize * 2;
    this.basePixelSize = this.pixelSize;
    this.zoomLevel = 0;
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
    );
    this.mtTimer = undefined;
    this.prev_arr = undefined;
  }

  calculateFractalLimit() {
    const fractalLimitX = this.centreCoords[0] - (this.width / 2) * this.pixelSize;
    const fractalLimitY = this.centreCoords[1] - (this.height / 2) * this.pixelSize;
    return { fractalLimitX, fractalLimitY };
  }

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
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    return [];
  }

  render(level) {
    let iterations;
    if (level) {
      iterations = level;
    } else {
      iterations = this.maxIter;
    }
    // eslint-disable-next-line no-async-promise-executor
    const renderPromise = new Promise(async (resolve, reject) => {
      if (this.mode === Mode.JAVASCRIPT) {
        const useSingleThread = true;
        this.webWorkerManager.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          iterations,
          this.juliaPoint,
          useSingleThread,
          RendererType.JAVASCRIPT,
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
          iterations,
          this.juliaPoint,
          useSingleThread,
          RendererType.WASM,
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
          iterations,
          this.juliaPoint,
          false,
          RendererType.JAVASCRIPT,
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
          iterations,
          this.juliaPoint,
          false,
          RendererType.WASM,
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

  updateCentreCoords(x, y) {
    this.centreCoords = [
      x || this.centreCoords[0],
      y || this.centreCoords[1],
    ];
  }
}
export default Renderer;
