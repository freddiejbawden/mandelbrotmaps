
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
    const nThreadsFree = navigator.hardwareConcurrency
    console.log(`Client has ${nThreadsFree} threads ready`);
    this.splitHeight = this.height/4;
    this.remaining_threads = nThreadsFree;
    for (let i = 0; i < nThreadsFree; i++) {
      const w = new Worker('./RenderWorker/worker.js', { type: 'module' });
      w.onmessage = (e) => {
        console.log(`Worker ${e.data.id} done`)
        console.log(`Arr ${e.data.arr[0]}`)
        this.arr.set(e.data.arr, this.splitHeight*4*e.data.id*this.width)
        console.log(`this.arr ${this.arr[this.splitHeight*e.data.id*this.width]}`)
        this.remaining_threads-=1
        if (this.remaining_threads == 0) {
          res(this.arr)
        }
      }
      w.postMessage({
        id: i,
        startRow: i*this.splitHeight,
        numRows: this.splitHeight,
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