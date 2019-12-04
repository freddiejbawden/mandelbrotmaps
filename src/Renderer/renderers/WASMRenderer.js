/* eslint-disable import/no-unresolved */
class WASMRenderer {
  constructor(pixelSize, width, height, centreCoords, maxIter) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.maxIter = maxIter;
    this.memory = undefined;
    this.loadWasm = this.loadWasm.bind(this);
    this.m = undefined;
  }

  async loadWasm() {
    try {
      const { Mandelbrot } = await import('mmap');
      const { memory } = await import('mmap/mmap_bg');
      this.m = Mandelbrot.new;
      this.wasm_renderer = Mandelbrot.new(
        this.width,
        this.height,
        this.pixelSize,
        this.maxIter,
        this.centreCoords[0],
        this.centreCoords[1],
      );
      this.memory = memory;
      return memory;
    } catch (err) {
      // TODO: alert user
      // eslint-disable-next-line no-console
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
      return [];
    }
  }

  async renderRange(xRect, yRect, dX, dY, arr, startRow, endRow,
    width, height, maxIter, centreCoordsX, centreCoordsY) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (res, rej) => {
      try {
        if (!this.wasm_renderer) {
          await this.loadWasm();
        }
        await this.wasm_renderer.set_max_i(maxIter);
        const arrPointer = await this.wasm_renderer.render_range(
          xRect,
          yRect,
          dX,
          dY,
          arr,
          startRow,
          endRow,
          width,
          height,
          centreCoordsX,
          centreCoordsY,
        );
        const fractalArr = new Uint8ClampedArray(
          this.memory.buffer,
          arrPointer,
          (endRow - startRow) * width * 4,
        );
        res({
          arr: fractalArr,
          width,
          height,
        });
      } catch (e) {
        rej(e);
      }
    });
  }

  async renderFromTo(s, e, pixelSize, width, height, centreCoords, maxIter) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (res, rej) => {
      if (!this.wasm_renderer) {
        await this.loadWasm();
      }
      const arrPointer = this.wasm_renderer.render_from_to(
        s,
        e,
        pixelSize,
        width,
        height,
        centreCoords[0],
        centreCoords[1],
        maxIter,
      );
      try {
        const arr = new Uint8ClampedArray(this.memory.buffer, arrPointer, (e - s) * 4);
        res(arr);
      } catch (err) {
        rej(err);
      }
    });
  }

  async render(pixelSize, width, height, centreCoords, maxIter) {
    if (!this.wasm_renderer) {
      await this.loadWasm();
    }
    const arrPointer = this.wasm_renderer.render(
      pixelSize,
      width,
      height,
      centreCoords[0],
      centreCoords[1],
      maxIter,
    );
    try {
      const arr = new Uint8ClampedArray(this.memory.buffer, arrPointer, width * height * 4);
      return {
        arr,
        width,
        height,
      };
    } catch (err) {
      // TODO: alert user
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    }
  }
}
export default WASMRenderer;
