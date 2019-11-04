import React from 'react';
import Timer from '../Timer'
import Settings from '../Settings'
import './MandelbrotViewer.css'
import Renderer from '../../Renderer'
class MandelbrotViewer extends React.Component {
  constructor(props) {
    super(props);
    this.fractal = React.createRef();
    this.timer = React.createRef();
    this.last_arr = undefined
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.state = {
      time: 0,
    };

    //Set up hooks for Setting Component
    this.updateIter = this.updateIter.bind(this);
    this.updateRenderMethod = this.updateRenderMethod.bind(this);
    this.updateCentreCoords = this.updateCentreCoords.bind(this);
    this.updatePixelSize = this.updatePixelSize.bind(this)
    this.zoomTimeout = undefined;
    this.renderer = new Renderer(this.props.renderMode, window.innerWidth, window.innerHeight, parseInt(this.props.maxi))
  }
  loadWasm = async () => {
    try {
      const {Mandelbrot} = await import('mmap');
      this.mandelbrot = Mandelbrot.new(this.width, this.height, this.fractalLimitX, this.fractalLimitY, this.pixelSize, this.state.max_i);
      if (this.state.renderMode === "wasm") {
        this.drawFractal()
      }
    } catch(err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  };
  updateIter(iter) {
    let i 
    if (!iter) {
      i = 100
    }  else {
      i = iter
    }
    this.renderer.max_i = parseInt(i);
    console.log(this.renderer)
    this.drawFractal()
  }
  updateRenderMethod(renderMode) {
    console.log(`Render Mode: ${renderMode}`)
    this.renderer.mode = parseInt(renderMode)
    this.drawFractal()
  }
  updatePixelSize(px) {
    this.renderer.pixelSize = px;
    this.drawFractal()
  }
  
  updateCentreCoords(x,y) {
    this.renderer.updateCentreCoords(x,y)
    this.drawFractal()
  }
  
  drawFractal() {
    let timerStart = Date.now();
    this.renderer.render().then((arr) => {
      console.log(`Viewer Len: ${arr.slice(arr.length-8)}`)
      const fractalContext = this.fractal.current.getContext('2d');
      fractalContext.canvas.width = window.innerWidth;
      fractalContext.canvas.height = window.innerHeight;
      const imageData = fractalContext.createImageData(fractalContext.canvas.width, window.innerHeight);
      imageData.data.set(arr)
      this.last_arr = arr
      fractalContext.putImageData(imageData,0,0)
      this.timer.current.updateTime(Date.now() - timerStart)
    }).catch((err) => {
      alert(`Error when drawing fractal ${err}`)
    })
    
  }
  

  async componentDidMount() {
    await this.loadWasm()
    window.addEventListener('resize', this.updateDimensions);
    window.performance.mark('fractal_rendered_start')
    this.drawFractal()
    window.performance.mark('fractal_rendered_end')
    window.performance.measure('fractal_render_time','fractal_rendered_start','fractal_rendered_end')
  }
  componentDidUpdate() {
    this.drawFractal()
  }

  handleClick(e) {
    // in case of a wide border, the boarder-width needs to be considered in the formula above
    //this.centreCoords = [-1,-1];
    //this.drawFractal()
  }
  render() {
    return (
      <div className="mandelbrot-viewer-container">
        <div className="info-panel">
          <Timer time={this.time} ref={this.timer}></Timer>
          <Settings selectedRenderMode={this.state.renderMode} updatePixelSize={this.updatePixelSize} updateCentreCoords={this.updateCentreCoords} updateIter={this.updateIter} updateRenderMethod={this.updateRenderMethod} maxi={this.state.max_i}></Settings>
        </div>
        <canvas onClick={(e) => this.handleClick(e)} className="fractal" id="fractal" ref={this.fractal}></canvas>
      </div>
    );
  }
}

export default MandelbrotViewer;
