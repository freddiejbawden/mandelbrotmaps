
class RustMultithreaded {
  constructor(pixelSize, width, height, centreCoords, max_i, memory, mandelbrotWASM) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.max_i = max_i;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.splitHeight = this.height
    this.remaining_threads  = 0;
    this.memory = memory;
    this.mandelbrotWASM = mandelbrotWASM
    this.arr = new Uint8ClampedArray(this.height*this.width*4)
    console.log(this.arr.length)
  };
  async loadWasm()  {  
    try {
      const {Mandelbrot} = await import('mmap');
      const { memory } = await import("mmap/mmap_bg")
      this.mandelbrotWASM = Mandelbrot
      this.memory = memory
    } catch(err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`)
    }
  }
  async render(pixelSize, width, height, centreCoords, max_i) {
    return new Promise((res,rej) => {
      console.log('Render Started ')
      let nThreadsFree = navigator.hardwareConcurrency
      console.log(`Client has ${nThreadsFree} threads ready`);
      this.pixelSplit = (height*width)/nThreadsFree
      this.remaining_threads = nThreadsFree;
      for (let i = 0; i < nThreadsFree; i++) {
        const w = new Worker('../renderworker.js', {  name: `w`, type: 'module' });
        w.onmessage = (e) => {
          console.log(e.data)
          console.log(`Worker ${e.data.id} done`)
          console.log('All done, ressolving')
          this.arr.set(e.data.arr, e.data.offset)
          this.remaining_threads-=1
          console.log(this.remaining_threads)
          if (this.remaining_threads === 0) {
            console.log('All done, resolving')
            res(this.arr)
          }
        }
        w.postMessage({
          id: i,
          startPixel: Math.floor(i*this.pixelSplit),
          endPixel: Math.floor((i+1)*this.pixelSplit),
          arrSize: this.pixelSplit*4,
          pixelSize: pixelSize,
          width: width,
          height: height,
          fractalLimitX: 0,
          fractalLimitY: 0,
          max_i: max_i,
          centreCoords: centreCoords
          })
        }
      });
  }
}
export default RustMultithreaded;