class WASMRenderer {
  constructor(pixelSize, width, height, centreCoords, max_i) {
    this.pixelSize = pixelSize
    this.width = width
    this.height = height
    this.centreCoords = centreCoords
    this.max_i = max_i
    this.memory = undefined
    this.loadWasm = this.loadWasm.bind(this)
  }
  async loadWasm()  {  
    try {
      const {Mandelbrot} = await import('mmap');
      const { memory } = await import("mmap/mmap_bg")
      this.wasm_renderer = Mandelbrot.new(this.width,this.height,this.pixelSize, this.max_i,this.centreCoords[0], this.centreCoords[1])
      this.memory = memory;
      return memory
    } catch(err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`)
    }
  }
  async render_from_to(s,e) {
    return new Promise(async(res,rej) => {
      if (!this.wasm_renderer) {
        await this.loadWasm()
      }
      const arr_pointer =  this.wasm_renderer.render_from_to(s,e)
      try {
        console.log((e-s)*4)
        const arr = new Uint8Array(this.memory.buffer, arr_pointer, (e-s)*4)
        res(arr)
      } catch (e) {
        rej(e);
      }
    })
    
  }
  async render(pixelSize, width, height, centreCoords, max_i) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.max_i = max_i;
    if (!this.wasm_renderer) {
      await this.loadWasm()
    }
    const arr_pointer =  this.wasm_renderer.render()
    try {

      const arr = new Uint8Array(this.memory.buffer, arr_pointer, this.width*this.height*4)
      return arr
    } catch (e) {
      console.log(e)
    }
  }
}
export default WASMRenderer;