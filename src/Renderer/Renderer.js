import Mode from '../utils/RenderMode';
import JavascriptRenderer from './renderers/JavascriptRenderer';
import WASMRenderer from './renderers/WASMRenderer';
import JSMultithreaded from './renderers/MultithreadedJS';
import RustMultithreaded from './renderers/RustMultithreaded';

class Renderer {
  constructor(renderMethod, width, height, maxIter) {
    this.mode = renderMethod;
    this.pixelSize = 0.003;
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
  }

  async renderRange(xRect, yRect, dX, dY, arr) {
    if (this.mode === Mode.JAVASCRIPT) {
      const jsRender = new JavascriptRenderer(
        this.pixelSize,
        this.width,
        this.height,
        this.centreCoords,
        this.maxIter,
      );
      const newArr = await jsRender.renderRange(
        xRect,
        yRect,
        dX,
        dY,
        arr,
        0,
        this.height,
      );
      return {
        arr: newArr,
        width: this.width,
        height: this.height,
      };
    }
    if (this.mode === Mode.WASM) {
      const a = await this.wasm_render.renderRange(
        xRect,
        yRect,
        dX,
        dY,
        this.width,
        this.height,
        this.centreCoords[0],
        this.centreCoords[1],
      );
      return {
        arr: a,
        width: this.width,
        height: this.height,
      };
    }
    if (this.mode === Mode.JAVASCRIPTMT) {
      const a = await this.jsMTRender.renderRange(
        this.pixelSize,
        this.width,
        this.height,
        this.centreCoords,
        this.maxIter,
        xRect,
        yRect,
        dX,
        dY,
        this.width,
        this.height,
        this.centreCoords,
      );
      return a;
    }

    const jsRender = new JavascriptRenderer(
      this.pixelSize,
      this.width,
      this.height,
      this.centreCoords,
      this.maxIter,
    );
    return {
      arr: await jsRender.renderRange(xRect, yRect, dX, dY, arr),
      width: this.width,
      height: this.height,
    };
  }

  render() {
    const renderPromise = new Promise((resolve, reject) => {
      if (this.mode === Mode.JAVASCRIPT) {
        const jsRender = new JavascriptRenderer(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
        );
        const arr = jsRender.render();
        resolve(arr);
      } else if (this.mode === Mode.WASM) {
        this.wasm_render.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
        ).then((arr) => resolve(arr));
      } else if (this.mode === Mode.JAVASCRIPTMT) {
        this.jsMTRender.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
        ).then((arr) => {
          resolve(arr);
        }).catch((e) => reject(e));
      } else if (this.mode === Mode.RUSTMT) {
        this.wasmMTRenderer.render(
          this.pixelSize,
          this.width,
          this.height,
          this.centreCoords,
          this.maxIter,
        ).then((arr) => {
          resolve(arr);
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
