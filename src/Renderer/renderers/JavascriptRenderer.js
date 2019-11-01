class MandelbrotRenderer {
  constructor(pixelSize, width, height, centreCoords, max_i) {
    this.pixelSize = pixelSize;
    this.width = width;
    this.height = height;
    this.centreCoords = centreCoords;
    this.max_i = max_i;
    this.fractalLimitX = 0;
    this.fractalLimitY = 0;
  };
  pixelsToCoord(x,y) {
    let coord_X = this.fractalLimitX + this.pixelSize*x;
    let coord_Y = this.fractalLimitY + this.pixelSize*y/(this.width/this.height);
    return [coord_X, coord_Y]
  }
  calculatePosition(pixelNum) {
    let x = (pixelNum % this.width)
    let y = Math.floor((pixelNum/this.height));
    return [x,y];
  }
  escapeAlgorithm(pixelNum) {
    
    const pixelPos = this.calculatePosition(pixelNum);
    const fractalPos = this.pixelsToCoord(...pixelPos);
    let x = 0
    let y = 0
    let i = 0
    while(x*x + y*y < 4 && i < this.max_i) {
      let xtemp = x*x - y*y + fractalPos[0]
      y = 2*x*y + fractalPos[1]
      x = xtemp
      i++
    }
    return (i);
  }
  calculateFractalLimit() {
    this.fractalLimitX = this.centreCoords[0]-(this.width/2)*this.pixelSize
    this.fractalLimitY = this.centreCoords[1]-(this.height/2)*this.pixelSize
  }
  render() {
    this.calculateFractalLimit()
    console.log(this.fractalLimitX, this.fractalLimitY)
    const arr = new Uint8ClampedArray(this.width*this.height*4);
    // Iterate through every pixel
    let colorScale = 255/this.max_i;
    console.log(colorScale)
    for (let i = 0; i < arr.length; i += 4) {
      let iter = this.escapeAlgorithm(i/4)*colorScale;
      arr[i] = iter;    // R value
      arr[i + 1] = iter;  // G value
      arr[i + 2] = iter;    // B value
      arr[i + 3] = 2555;  // A value
    }
    return arr
  }
}

export default MandelbrotRenderer;