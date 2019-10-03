import React from 'react';
import Timer from '../Timer/Timer'
import Settings from '../Settings/Settings'
import './Mandelbrot.css'
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
    };
    this.max_i = 200;
    this.updateIter = this.updateIter.bind(this);
  }
  updateIter(iter) {
    if (!iter) {
      this.max_i = 100
    }  else {
      this.max_i = iter
    }
    this.drawFractal()
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
   
    while(x*x + y*y < 4 && i < this.max_i) {
      let xtemp = x*x - y*y + fractalPos[0]
      y = 2*x*y + fractalPos[1]
      x = xtemp
      i++
    }
    return (i)
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

    console.log("mounted");
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    console.log( this.width,  this.height)
    this.fractalLimitX = this.centreCoords[0]-(this.width*this.pixelSize)/2
    console.log(this.fractalLimitX, (this.width*this.pixelSize)+this.fractalLimitX)

    this.fractalLimitY = this.centreCoords[1]-(this.height*this.pixelSize)/2
    console.log(this.fractalLimitY, (this.height*this.pixelSize)+this.fractalLimitY)

    const fractalContext = this.fractal.current.getContext('2d');
    fractalContext.canvas.width = window.innerWidth;
    fractalContext.canvas.height = window.innerHeight;
    const arr = new Uint8ClampedArray(this.width*this.height*4);
    console.log(arr.length)
    // Iterate through every pixel
    let colorScale = 255/this.max_i;
    for (let i = 0; i < arr.length; i += 4) {
      let iter = this.escapeAlgorithm(i/4)
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
    window.addEventListener('resize', this.updateDimensions);
    this.drawFractal()
    
  }
  render() {
    return (
      <div>
        <div className="info-panel">
          <Timer time={this.time} ref={this.timer}></Timer>
          <Settings updateIter={this.updateIter} ></Settings>
        </div>
        <canvas className="fractal" id="fractal" ref={this.fractal}></canvas>
      </div>
    );
  }
}

export default Mandelbrot;
