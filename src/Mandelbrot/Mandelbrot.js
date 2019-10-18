import React from 'react';

import Timer from '../Timer/Timer'
import Settings from '../Settings/Settings'
import './Mandelbrot.css'
import { runInThisContext } from 'vm';
class Mandelbrot extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: window.innerWidth, height: window.innerHeight };
    this.fractal = React.createRef();
    this.timer = React.createRef();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centreCoords = [-1,0];
    this.pixelSize = 0.003 
    this.state = {
      time: 0,
      max_i: 200,
      renderMode: this.props.renderMode
    };
    this.updateIter = this.updateIter.bind(this);
    this.updateRenderMethod = this.updateRenderMethod.bind(this);
    this.mandelbrot = undefined;
  }
  loadWasm = async () => {
    try {
      const {Mandelbrot} = await import('mmap');
      this.mandelbrot = Mandelbrot.new(this.width, this.height, this.fractalLimitX, this.fractalLimitY, this.pixelSize, this.state.max_i);
      console.log(this.width, this.height, this.fractalLimitX, this.fractalLimitY, this.pixelSize, this.state.max_i)
      if (this.state.renderMode == "wasm") {
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
    console.log(i)
    if (this.mandelbrot) {
      this.mandelbrot.set_max_i(i)
    }
    this.setState({
      max_i: parseInt(i)
    });
  }
  updateRenderMethod(renderMode) {
    this.setState({
      renderMode
    })
  }
  pixelsToCoord(x,y) {
    let coord_X = this.fractalLimitX + this.pixelSize*x;
    let coord_Y = this.fractalLimitY + this.pixelSize*y/(this.width/this.height);
    return [coord_X, coord_Y]
  }
  escapeAlgorithm(pixelNum) {
    const pixelPos = this.calculatePosition(pixelNum);
    const fractalPos = this.pixelsToCoord(...pixelPos)
  
    let x = 0
    let y = 0
    let i = 0
   
    while(x*x + y*y < 4 && i < this.state.max_i) {
      let xtemp = x*x - y*y + fractalPos[0]
      y = 2*x*y + fractalPos[1]
      x = xtemp
      i++
    }
    
    return (i);
  }
  updateDimensions = () => {
    this.drawFractal()
  };
  calculatePosition(pixelNum) {
    let x = (pixelNum % this.width)
    let y = Math.floor((pixelNum/this.height));
    return [x,y];
  }
  drawFractal() {
    let timerStart = Date.now();
    console.log(this.state.renderMode)
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.fractalLimitX = this.centreCoords[0]-(this.width*this.pixelSize)/2
    this.fractalLimitY = this.centreCoords[1]-(this.height*this.pixelSize)/2

    if (this.state.renderMode == "wasm") {
      this.mandelbrot.set_width_height(this.width, this.height);
      this.mandelbrot.set_limits(this.fractalLimitX, this.fractalLimitY)
    }

    const fractalContext = this.fractal.current.getContext('2d');
    fractalContext.canvas.width = window.innerWidth;
    fractalContext.canvas.height = window.innerHeight;

    

    const arr = new Uint8ClampedArray(this.width*this.height*4);
    // Iterate through every pixel
    let colorScale = 255/this.state.max_i;
    console.log(colorScale)
    for (let i = 0; i < arr.length; i += 4) {
      let iter;
      if (this.state.renderMode === "javascript") {
        iter = this.escapeAlgorithm(i/4)
      } else if (this.state.renderMode === "wasm") {
        if (this.mandelbrot) {
          iter = this.mandelbrot.escape_algorithm(i/4);
        }
      } else {
        iter = 0;
      }
     
      arr[i + 0] = iter*colorScale;;    // R value
      arr[i + 1] = iter*colorScale;  // G value
      arr[i + 2] = iter*colorScale;    // B value
      arr[i + 3] = 255;  // A value
    }

    // Initialize a new ImageData object
    let imageData = new ImageData(arr, this.width);
    fractalContext.putImageData(imageData, 0,0);
    this.timer.current.updateTime(Date.now() - timerStart)
  }
  
  componentDidMount() {
    this.loadWasm()
    window.addEventListener('resize', this.updateDimensions);
    window.performance.mark('fractal_rendered_start')
    this.drawFractal()
    window.performance.mark('fractal_rendered_end')
    window.performance.measure('fractal_render_time','fractal_rendered_start','fractal_rendered_end')

  }
  componentDidUpdate() {
    this.drawFractal()
  }
  render() {
    return (
      <div>
        <div className="info-panel">
          <Timer time={this.time} ref={this.timer}></Timer>
          <Settings selectedRenderMode={this.state.renderMode} updateIter={this.updateIter} updateRenderMethod={this.updateRenderMethod} ></Settings>
        </div>
        <canvas className="fractal" id="fractal" ref={this.fractal}></canvas>
      </div>
    );
  }
}

export default Mandelbrot;
