/* eslint-disable import/no-unresolved */
import idGenerator from '../../utils/IDGenerator';

class WebWorkerManager {
  /**
   * @param {FractalType} type which fractal to render
   * @param {int} nChunks number of chunks to split the fractal into
   */
  constructor(type, nChunks) {
    this.remaining_chunks = 0;
    this.workers = [];
    this.type = type;
    this.chunkLimit = nChunks || 4;
  }

  /**
   * Uses webworkers to render the image
   * @param {*} pixelSize the size of the world space that one pixel represents
   * @param {*} width the width of the fractal in pixels
   * @param {*} height the height of the fractal in pixels
   * @param {*} centreCoords world space centre coordinates
   * @param {*} maxIter the iteration limit
   * @param {*} juliaPoint x and y point of the julia point
   * @param {*} singleThread override web workers to only use one
   * @param {RenderMode} renderer render mode to use
   * @param {*} showRenderTrace flag to show the render trace
   * @param {*} lowRes flag to do a low iteration pass
   * @param {ColorOptions} coloringMethod method to color the fractal by
   */
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
      // Find the number of web workers available
      const hardwareConcurrency = navigator.hardwareConcurrency || 1;
      const nThreadsFree = (singleThread) ? 1 : hardwareConcurrency;
      const nChunks = (singleThread) ? 1 : this.chunkLimit;
      // number of pixels per chunk
      this.pixelSplit = (height * width) / nChunks;
      this.remaining_chunks = nChunks;
      const roundID = idGenerator();
      // spin up the web workers
      if (this.workers.length < nThreadsFree) {
        for (let i = this.workers.length; i < nThreadsFree; i += 1) {
          const w = new Worker('./worker/renderworker.js', { name: 'w', type: 'module' });
          this.workers.push(w);
        }
      }
      const renderChunk = (w, startPixel, endPixel, wid) => {
        // send chunk to worker
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
        // set up call back function for when worker is done
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
              // if more chunks are needed to be processed, take another one
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

  /**
   * Uses webworkers to render range the image
    * @param {*} pixelSize the size of the world space that one pixel represents
   * @param {*} width the width of the fractal in pixels
   * @param {*} height the height of the fractal in pixels
   * @param {*} centreCoords world space centre coordinates
   * @param {*} maxIter the iteration limit
   * @param {*} oldArr the last image that was rendered
   * @param {*} xRect the horizontal protion to re-redner
   * @param {*} yRect the vertical portion to re render
   * @param {*} dX the X offset of the image
   * @param {*} dY the Y offset of the image
   * @param {*} juliaPoint x and y point of the julia point
   * @param {*} singleThread override web workers to only use one
   * @param {*} renderer render mode to use
   * @param {*} showRenderTrace flag to show the render trace
   * @param {ColorOptions} coloringMethod method to color the fractal by
   */
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
      const nThreadsFree = (singleThread) ? 1 : (navigator.hardwareConcurrency || 1);
      const nChunks = (singleThread) ? 1 : this.chunkLimit;
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
        // send message to webworker
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
