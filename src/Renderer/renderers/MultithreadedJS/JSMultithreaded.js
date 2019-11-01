
class JSMultithreaded {
  constructor(pixelSize, width, height, centreCoords, max_i) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.max_i = max_i;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.splitHeight = this.height
    this.remaining_threads  = 0;
    this.arr = new Uint8ClampedArray(this.height*this.width*4)
    console.log(this.arr.length)
  };
  async render() {
    return new Promise((res,rej) => {
      console.log('Render Started ')
    let nThreadsFree = navigator.hardwareConcurrency
    //nThreadsFree = 1
    console.log(`Client has ${nThreadsFree} threads ready`);
    this.pixelSplit = (this.height*this.width)/nThreadsFree
    this.remaining_threads = nThreadsFree;
    for (let i = 0; i < nThreadsFree; i++) {
      const w = new Worker('./RenderWorker/worker.js', { type: 'module' });
      w.onmessage = (e) => {
        console.log(`Worker ${e.data.id} done,\n\treturned array of length ${e.data.arr.length}`)
        console.log(e.data.arr.slice(0,8))
        this.arr.set(e.data.arr, e.data.offset)
        this.remaining_threads-=1
        if (this.remaining_threads == 0) {
          res(this.arr)
        }
      }
      w.postMessage({
        id: i,
        startPixel: i*this.pixelSplit,
        endPixel: (i+1)*this.pixelSplit,
        arrSize: this.pixelSplit*4,
        pixelSize: this.pixelSize,
        width: this.width,
        height: this.height,
        fractalLimitX: this.fractalLimitX,
        fractalLimitY: this.fractalLimitY,
        max_i: this.max_i,
        centreCoords: this.centreCoords
        })
      }
    });
  }
}
export default JSMultithreaded;