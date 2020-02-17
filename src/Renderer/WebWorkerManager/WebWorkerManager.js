/* eslint-disable import/no-unresolved */
import idGenerator from '../../utils/IDGenerator';

class WebWorkerManager {
  constructor(type) {
    this.remaining_chunks = 0;
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
    showRenderTrace,
    lowRes,
    coloringMethod,
  ) {
    return new Promise((res) => {
      this.nextChunk = 0;
      this.arr = new Uint8ClampedArray(height * width * 4);
      const hardwareConcurrency = navigator.hardwareConcurrency || 1;
      const nThreadsFree = (singleThread) ? 1 : hardwareConcurrency;
      const nChunks = (singleThread) ? 1 : 4;
      this.pixelSplit = (height * width) / nChunks;
      this.remaining_chunks = nChunks;
      const roundID = idGenerator();
      if (this.workers.length < nThreadsFree) {
        for (let i = this.workers.length; i < nThreadsFree; i += 1) {
          const w = new Worker('./worker/renderworker.js', { name: 'w', type: 'module' });
          this.workers.push(w);
        }
      }
      const renderChunk = (w, startPixel, endPixel, wid) => {
        w.postMessage({
          lowRes,
          showRenderTrace,
          wid,
          type: this.type,
          id: roundID,
          renderer,
          startPixel,
          endPixel,
          arrSize: Math.floor((endPixel - startPixel) * 4),
          pixelSize,
          width,
          height,
          maxIter,
          centreCoords,
          juliaPoint,
          coloringMethod,
        });
        this.nextChunk += 1;
      };
      for (let i = 0; i < Math.min(nThreadsFree, nChunks); i += 1) {
        const w = this.workers[i];
        const id = i;
        w.onmessage = (e) => {
          if (e.data.id === roundID) {
            this.arr.set(e.data.arr, e.data.offset);
            this.remaining_chunks -= 1;
            if (this.remaining_chunks === 0) {
              res(
                {
                  arr: this.arr,
                  width,
                  height,
                },
              );
            } else if (this.remaining_chunks >= nThreadsFree) {
              renderChunk(
                w,
                Math.floor((this.nextChunk) * this.pixelSplit),
                Math.floor((this.nextChunk + 1) * this.pixelSplit),
                id,
              );
            }
          }
        };
        renderChunk(
          w,
          Math.floor((this.nextChunk) * this.pixelSplit),
          Math.floor((this.nextChunk + 1) * this.pixelSplit),
          i,
        );
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
    showRenderTrace,
    coloringMethod,
  ) {
    return new Promise((res) => {
      this.nextChunk = 0;
      this.width = width;
      this.height = height;
      const newArr = new Uint8ClampedArray(height * width * 4);
      const nThreadsFree = (singleThread) ? 1 : navigator.hardwareConcurrency;
      const nChunks = (singleThread) ? 1 : 4;
      this.pixelSplit = height / nChunks;
      this.remaining_chunks = nChunks;
      const roundID = idGenerator();
      if (this.workers.length < nThreadsFree) {
        for (let i = this.workers.length; i < nThreadsFree; i += 1) {
          const w = new Worker('./worker/renderworker.js', { name: 'w', type: 'module' });
          this.workers.push(w);
        }
      }
      const renderChunk = (w, startRow, endRow, wid) => {
        w.postMessage({
          wid,
          type: this.type,
          id: roundID,
          workerID: idGenerator(),
          renderer,
          mode: 'partial',
          startRow,
          endRow,
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
          showRenderTrace,
          coloringMethod,
        });
        this.nextChunk += 1;
      };

      for (let i = 0; i < Math.min(nThreadsFree, nChunks); i += 1) {
        const id = i;
        const w = this.workers[i];
        w.onmessage = (e) => {
          if (e.data.id === roundID) {
            try {
              newArr.set(e.data.fractal.arr, e.data.offset);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error(err);
            }
            this.remaining_chunks -= 1;
            if (this.remaining_chunks === 0) {
              this.arr = newArr;
              res(
                {
                  arr: this.arr,
                  height: this.height,
                  width: this.width,
                },
              );
            } else if (this.remaining_chunks >= nThreadsFree) {
              renderChunk(
                w,
                Math.floor(this.nextChunk * this.pixelSplit),
                Math.floor((this.nextChunk + 1) * this.pixelSplit),
                id,
              );
            }
          }
        };
        renderChunk(
          w,
          Math.floor(this.nextChunk * this.pixelSplit),
          Math.floor((this.nextChunk + 1) * this.pixelSplit),
          id,
        );
      }
    });
  }
}
export default WebWorkerManager;
