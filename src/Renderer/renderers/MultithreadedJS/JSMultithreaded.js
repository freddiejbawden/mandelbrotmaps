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
    this.workers = []

    this.arr = new Uint8ClampedArray(this.height*this.width*4)
    console.log(this.arr.length)
  };
  async render(pixelSize, width, height, centreCoords, max_i) {
    return new Promise((res,rej) => {
    console.log('Render Started ')
    let nThreadsFree = navigator.hardwareConcurrency
    console.log(`Client has ${nThreadsFree} threads ready`);
    
    this.pixelSplit = (height*width)/nThreadsFree
    console.log(this.pixelSplit)
    this.remaining_threads = nThreadsFree;
    console.log(`Currently ${this.workers.length} worker ready`);

    if (this.workers.length < nThreadsFree) {
      console.log(`Creating ${nThreadsFree - this.workers.length} threads`)
      for (let i = this.workers.length; i < nThreadsFree; i++) {
        const w = new Worker('../renderworker.js', {  name: `w`, type: 'module' });
        this.workers.push(w);
      }
    }
    for (let i = 0; i < nThreadsFree; i++) {
      const w = new Worker('./../renderworker.js', { name: `js`, type: 'module' });
      w.onmessage = (e) => {
        console.log(`Worker ${e.data.id} done,\n\treturned array of length ${e.data.arr.length}`)
        console.log(e.data.arr.slice(0,8))
        this.arr.set(e.data.arr, e.data.offset)
        this.remaining_threads-=1
        if (this.remaining_threads === 0) {
          console.log('Done!')
          res(this.arr)
        }
      }
      w.postMessage({
        id: i,
        renderer: "js",
        startPixel: Math.floor(i*this.pixelSplit),
        endPixel: Math.floor((i+1)*this.pixelSplit),
        arrSize: this.pixelSplit*4,
        pixelSize: pixelSize,
        width: width,
        height: height,
        fractalLimitX: this.fractalLimitX,
        fractalLimitY: this.fractalLimitY,
        max_i: max_i,
        centreCoords: centreCoords,
        })
      }
    });
  }
}
export default JSMultithreaded;