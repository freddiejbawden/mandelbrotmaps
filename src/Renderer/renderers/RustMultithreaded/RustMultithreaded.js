/* eslint-disable import/no-unresolved */
import idGenerator from '../../../utils/IDGenerator';

class RustMultithreaded {
  constructor(pixelSize, width, height, centreCoords, maxIter, memory, mandelbrotWASM) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.maxIter = maxIter;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.splitHeight = this.height;
    this.remaining_threads = 0;
    this.memory = memory;
    this.mandelbrotWASM = mandelbrotWASM;
    this.workers = [];
    this.arr = new Uint8ClampedArray(this.height * this.width * 4);
  }

  async loadWasm() {
    try {
      const { Mandelbrot } = await import('mmap');
      const { memory } = await import('mmap/mmap_bg');
      this.mandelbrotWASM = Mandelbrot;
      this.memory = memory;
    } catch (err) {
      // TODO: alert user
      // eslint-disable-next-line no-console
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  }

  async render(pixelSize, width, height, centreCoords, maxIter) {
    return new Promise((res) => {
      this.arr = new Uint8ClampedArray(height * width * 4);
      const nThreadsFree = navigator.hardwareConcurrency;
      this.pixelSplit = (height * width) / nThreadsFree;
      this.remaining_threads = nThreadsFree;
      const roundID = idGenerator();
      if (this.workers.length < this.remaining_threads) {
        for (let i = this.workers.length; i < this.remaining_threads; i += 1) {
          const w = new Worker('../renderworker.js', { name: 'w', type: 'module' });
          this.workers.push(w);
        }
      }
      for (let i = 0; i < this.remaining_threads; i += 1) {
        const w = this.workers[i];
        w.onmessage = (e) => {
          if (e.data.id === roundID) {
            this.arr.set(e.data.arr, e.data.offset);
            this.remaining_threads -= 1;
            if (this.remaining_threads === 0) {
              res(
                {
                  arr: this.arr,
                  width,
                  height,
                },
              );
            }
          }
        };
        w.postMessage({
          id: roundID,
          renderer: 'wasm',
          startPixel: Math.floor(i * this.pixelSplit),
          endPixel: Math.floor((i + 1) * this.pixelSplit),
          arrSize: this.pixelSplit * 4,
          pixelSize,
          width,
          height,
          fractalLimitX: 0,
          fractalLimitY: 0,
          maxIter,
          centreCoords,
        });
      }
    });
  }
}
export default RustMultithreaded;
