import idGenerator from '../../../utils/IDGenerator';

class JSMultithreaded {
  constructor(pixelSize, width, height, centreCoords, maxIter) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.maxIter = maxIter;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.splitHeight = this.height;
    this.remaining_threads = 0;
    this.workers = [];

    this.arr = new Uint8ClampedArray(this.height * this.width * 4);
  }

  update(pixelSize, width, height, centreCoords, maxIter) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.maxIter = maxIter;
  }

  async renderRange(pixelSize, width, height, centreCoords, maxIter, oldArr, xRect, yRect, dX, dY) {
    return new Promise((res) => {
      this.update(pixelSize, width, height, centreCoords, maxIter);
      const newArr = new Uint8ClampedArray(this.height * this.width * 4);
      const nThreadsFree = navigator.hardwareConcurrency;
      this.pixelSplit = this.height / nThreadsFree;
      this.remaining_threads = nThreadsFree;
      const roundID = idGenerator();
      if (this.workers.length < nThreadsFree) {
        for (let i = this.workers.length; i < nThreadsFree; i += 1) {
          const w = new Worker('../renderworker.js', { name: 'w', type: 'module' });
          this.workers.push(w);
        }
      }
      for (let i = 0; i < nThreadsFree; i += 1) {
        const w = this.workers[i];
        w.onmessage = (e) => {
          if (e.data.id === roundID) {
            newArr.set(e.data.fractal.arr, e.data.offset);
            this.remaining_threads -= 1;
            if (this.remaining_threads === 0) {
              res({
                arr: newArr,
                width,
                height,
              });
            }
          }
        };
        console.log(maxIter);
        w.postMessage({
          id: roundID,
          workerID: idGenerator(),
          renderer: 'js',
          type: 'partial',
          startRow: Math.floor(i * this.pixelSplit),
          endRow: Math.floor((i + 1) * this.pixelSplit),
          arrSize: ((this.width * this.height) / nThreadsFree) * 4,
          pixelSize: this.pixelSize,
          width: this.width,
          height: this.height,
          fractalLimitX: this.fractalLimitX,
          fractalLimitY: this.fractalLimitY,
          maxIter: this.maxIter,
          centreCoords: this.centreCoords,
          oldArr,
          xRect,
          yRect,
          dX,
          dY,
        });
      }
    });
  }


  async render(pixelSize, width, height, centreCoords, maxIter) {
    return new Promise((res) => {
      this.arr = new Uint8ClampedArray(height * width * 4);
      const nThreadsFree = navigator.hardwareConcurrency;
      this.pixelSplit = (height * width) / nThreadsFree;
      this.remaining_threads = nThreadsFree;
      const roundID = idGenerator();
      if (this.workers.length < nThreadsFree) {
        for (let i = this.workers.length; i < nThreadsFree; i += 1) {
          const w = new Worker('../renderworker.js', { name: 'w', type: 'module' });
          this.workers.push(w);
        }
      }
      for (let i = 0; i < nThreadsFree; i += 1) {
        const w = this.workers[i];
        w.onmessage = (e) => {
          if (e.data.id === roundID) {
            this.arr.set(e.data.arr, e.data.offset);
            this.remaining_threads -= 1;
            if (this.remaining_threads === 0) {
              res(
                {
                  arr: this.arr,
                  height,
                  width,
                },
              );
            }
          }
        };
        w.postMessage({
          id: roundID,
          renderer: 'js',
          startPixel: Math.floor(i * this.pixelSplit),
          endPixel: Math.floor((i + 1) * this.pixelSplit),
          arrSize: this.pixelSplit * 4,
          pixelSize,
          width,
          height,
          fractalLimitX: this.fractalLimitX,
          fractalLimitY: this.fractalLimitY,
          maxIter,
          centreCoords,
        });
      }
    });
  }
}
export default JSMultithreaded;
