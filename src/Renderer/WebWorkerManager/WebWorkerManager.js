/* eslint-disable import/no-unresolved */
import idGenerator from '../../utils/IDGenerator';

class WebWorkerManager {
  constructor(type) {
    this.remaining_threads = 0;
    this.workers = [];
    this.type = type;
  }

  async render(
    pixelSize,
    width,
    height,
    centreCoords,
    maxIter,
    juliaPoint,
    singleThread,
    renderer,
  ) {
    return new Promise((res) => {
      this.arr = new Uint8ClampedArray(height * width * 4);
      const hardwareConcurrency = navigator.hardwareConcurrency || 1;
      const nThreadsFree = (singleThread) ? 1 : hardwareConcurrency;
      this.pixelSplit = (height * width) / nThreadsFree;
      this.remaining_threads = nThreadsFree;
      const roundID = idGenerator();
      if (this.workers.length < this.remaining_threads) {
        for (let i = this.workers.length; i < this.remaining_threads; i += 1) {
          const w = new Worker('./worker/renderworker.js', { name: 'w', type: 'module' });
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
          type: this.type,
          id: roundID,
          renderer,
          startPixel: Math.floor(i * this.pixelSplit),
          endPixel: Math.floor((i + 1) * this.pixelSplit),
          arrSize: this.pixelSplit * 4,
          pixelSize,
          width,
          height,
          maxIter,
          centreCoords,
          juliaPoint,
        });
      }
    });
  }

  async renderRange(
    pixelSize,
    width,
    height,
    centreCoords,
    maxIter,
    oldArr,
    xRect,
    yRect,
    dX,
    dY,
    juliaPoint,
    singleThread,
    renderer,
  ) {
    return new Promise((res) => {
      this.width = width;
      this.height = height;
      const newArr = new Uint8ClampedArray(height * width * 4);
      const nThreadsFree = (singleThread) ? 1 : navigator.hardwareConcurrency;
      this.pixelSplit = height / nThreadsFree;
      this.remaining_threads = nThreadsFree;
      const roundID = idGenerator();
      if (this.workers.length < nThreadsFree) {
        for (let i = this.workers.length; i < nThreadsFree; i += 1) {
          const w = new Worker('./worker/renderworker.js', { name: 'w', type: 'module' });
          this.workers.push(w);
        }
      }
      for (let i = 0; i < nThreadsFree; i += 1) {
        const w = this.workers[i];
        w.onmessage = (e) => {
          if (e.data.id === roundID) {
            try {
              newArr.set(e.data.fractal.arr, e.data.offset);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error(err);
            }
            this.remaining_threads -= 1;
            if (this.remaining_threads === 0) {
              this.arr = newArr;
              res(
                {
                  arr: this.arr,
                  height: this.height,
                  width: this.width,
                },
              );
            }
          }
        };
        w.postMessage({
          type: this.type,
          id: roundID,
          workerID: idGenerator(),
          renderer,
          mode: 'partial',
          startRow: Math.floor(i * this.pixelSplit),
          endRow: Math.floor((i + 1) * this.pixelSplit),
          pixelSize,
          width,
          height,
          maxIter,
          centreCoords,
          oldArr,
          xRect,
          yRect,
          dX,
          dY,
          juliaPoint,
        });
      }
    });
  }
}
export default WebWorkerManager;
