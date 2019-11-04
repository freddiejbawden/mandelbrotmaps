import Mode from '../utils/RenderMode'
import JavascriptRenderer from './renderers/JavascriptRenderer';
import WASMRenderer from './renderers/WASMRenderer';
import JSMultithreaded from './renderers/MultithreadedJS';
import RustMultithreaded from './renderers/RustMultithreaded'
class Renderer {
  constructor(renderMethod, width, height ,max_i) {
    this.mode = renderMethod;
    this.pixelSize = 0.003;
    this.width = width;
    this.height = height;
    console.log(width,height)
    this.centreCoords = [-1,0]
    this.max_i = parseInt(max_i);
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
    this.wasm_render = new WASMRenderer(this.pixelSize, this.width, this.height, this.centreCoords,this.max_i)
    this.wasm_mt_renderer = new RustMultithreaded(this.pixelSize, this.width, this.height, this.centreCoords,this.max_i);
  }
  render() {
    console.log(this.mode)
    const renderPromise = new Promise(async (resolve, reject) => {
      if (this.mode === Mode.JAVASCRIPT) {
        const js_render = new JavascriptRenderer(this.pixelSize, this.width, this.height, this.centreCoords,this.max_i)
        const arr = js_render.render()
        resolve(arr)
      } else if (this.mode === Mode.WASM) {
        const arr = await this.wasm_render.render(this.pixelSize, this.width, this.height, this.centreCoords,this.max_i)
        resolve(arr)
      } else if (this.mode === Mode.JAVASCRIPTMT) {
        const js_mt_render = new JSMultithreaded(this.pixelSize, this.width, this.height, this.centreCoords,this.max_i);
        js_mt_render.render().then((arr) => {
          console.log(arr[0])
          resolve(arr)
        }).catch((e) => reject(e))
      } else if (this.mode === Mode.RUSTMT) {
        await this.wasm_mt_renderer.render(this.pixelSize, this.width, this.height, this.centreCoords,this.max_i)
        .then((arr) => {
          console.log(arr[0])
          resolve(arr)
        });
      } else {
        reject(`Render Mode ${this.mode} is not valid`)
      }
    })
    return renderPromise  
  }
  updateCentreCoords(x,y) {
    this.centreCoords = [
      x ? x : this.centreCoords[0],
      y ? y : this.centreCoords[1]
    ]
  }
}
export default Renderer