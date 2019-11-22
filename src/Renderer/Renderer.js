import Mode from '../utils/RenderMode';
import JavascriptRenderer from './renderers/JavascriptRenderer';
import WASMRenderer from './renderers/WASMRenderer';
import JSMultithreaded from './renderers/MultithreadedJS';
import RustMultithreaded from './renderers/RustMultithreaded';

class Renderer {
  constructor(renderMethod, width, height, maxIter) {
    this.mode = renderMethod;
    this.pixelSize = 0.004;
    this.zoomLevel = 0;
    this.width = width;
    this.height = height;
    this.centreCoords = [-1, 0];
    this.maxIter = parseInt(maxIter, 10);
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.timer = undefined;
    this.wasm_render = new WASMRenderer(
      this.pixelSize,
      this.width,
      this.height,
      this.centreCoords,
      this.maxIter,
    );
    this.wasmMTRenderer = new RustMultithreaded(
      this.pixelSize,
      this.width,
      this.height,
      this.centreCoords,
      this.maxIter,
    );
    this.jsMTRender = new JSMultithreaded(
      this.pixelSize,
      this.width,
      this.height,
      this.centreCoords,
      this.maxIter,
    );
    this.mtTimer = undefined;
    this.prev_arr = undefined;
  }

  /* Adapted from https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate */
  zoomOnPoint(canvasZoom, pixX, pixY) {
    const newPixelSize = this.pixelSize / canvasZoom;
    const newFractalLimitX = this.centreCoords[0] - (this.width / 2) * newPixelSize;
    const newFractalLimitY = this.centreCoords[1] - (this.height / 2) * newPixelSize;
    // calculate the pixel pos in the new zoom level
    const newX = newFractalLimitX + pixX * newPixelSize;
    const newY = newFractalLimitY + pixY * newPixelSize;

    const oldFractalLimitX = this.centreCoords[0] - (this.width / 2) * this.pixelSize;
    const oldFractalLimitY = this.centreCoords[1] - (this.height / 2) * this.pixelSize;
    // calculate the pixel pos in the new zoom level
    const oldX = oldFractalLimitX + pixX * this.pixelSize;
    const oldY = oldFractalLimitY + pixY * this.pixelSize;
    this.centreCoords[0] += -1 * (newX - oldX);
    this.centreCoords[1] += -1 * (newY - oldY);
    this.pixelSize = newPixelSize;
  }

  async renderRange(xRect, yRect, dX, dY) {
    if (this.mode === Mode.JAVASCRIPT) {
      const jsRender = new JavascriptRenderer(
        this.pixelSize,
        this.width,
        this.height,
        this.centreCoords,
        this.maxIter,
      );
      const clamped = new Uint8ClampedArray(this.prev_arr);
      const fractal = await jsRender.renderRange(
        xRect,
        yRect,
        dX,
        dY,
        clamped,
        0,
        this.height,
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    if (this.mode === Mode.WASM) {
      const clamped = new Uint8ClampedArray(this.prev_arr);
      const fractal = await this.wasm_render.renderRange(
        xRect,
        yRect,
        dX,
        dY,
        clamped,
        0,
        this.height,
        this.width,
        this.height,
        this.maxIter,
        this.centreCoords[0],
        this.centreCoords[1],
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    if (this.mode === Mode.JAVASCRIPTMT) {
      const fractal = await this.jsMTRender.renderRange(
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
        this.width,
        this.height,
        this.centreCoords,
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    if (this.mode === Mode.RUSTMT) {
      const clamped = new Uint8ClampedArray(this.prev_arr);
      const fractal = await this.wasmMTRenderer.renderRange(
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
      );
      this.prev_arr = fractal.arr;
      return fractal;
    }
    return [];
  }

  render() {
    // eslint-disable-next-line no-async-promise-executor
    const renderPromise = new Promise(async (resolve, reject) => {
      if (this.mode === Mode.JAVASCRIPT) {
        const jsRender = new JavascriptRenderer(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
        );
        const fractal = await jsRender.render();
        this.prev_arr = fractal.arr;
        resolve(fractal);
      } else if (this.mode === Mode.WASM) {
        this.wasm_render.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
        ).then((fractal) => {
          this.prev_arr = fractal.arr;
          resolve(fractal);
        });
      } else if (this.mode === Mode.JAVASCRIPTMT) {
        this.jsMTRender.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
        ).then((fractal) => {
          this.prev_arr = fractal.arr;
          resolve(fractal);
        }).catch((e) => reject(e));
      } else if (this.mode === Mode.RUSTMT) {
        this.wasmMTRenderer.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
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
