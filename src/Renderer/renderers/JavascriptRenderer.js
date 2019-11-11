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
    let coord_Y = this.fractalLimitY + this.pixelSize*y
    return [coord_X, coord_Y]
  }
  calculatePosition(pixelNum) {
    let x = (pixelNum % this.width)
    let y = Math.floor((pixelNum/this.width));
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
  renderRange(xRect,yRect,dX,dY,arr) {

    this.calculateFractalLimit()
    let colorScale = 255/this.max_i;
    console.log(xRect,yRect)
    const new_arr = new Uint8ClampedArray(this.width*this.height*4);
    for (let i = 0; i < new_arr.length; i += 4) {
      let coords = this.calculatePosition(i/4)      
      if (
          (xRect && xRect.pointInBounds(coords[0],coords[1])) ||
          (yRect && yRect.pointInBounds(coords[0],coords[1]))) {
        let iter = this.escapeAlgorithm(i/4)*colorScale
        new_arr[i] = iter;    // R value
        new_arr[i + 1] = iter;  // G value
        new_arr[i + 2] = iter;    // B value
        new_arr[i + 3] = 255;  // A value
      } else {
        //copy
        const oldArrPos = ((coords[1]-dY)*this.width) + (coords[0]-dX)
       let iter = this.escapeAlgorithm(i/4)*colorScale
        new_arr[i] = arr[oldArrPos*4];    // R value
        new_arr[i + 1] = arr[oldArrPos*4+1];  // G value
        new_arr[i + 2] = arr[oldArrPos*4+2];    // B value
        new_arr[i + 3] = 255;  // A value
      }
    }
    return new_arr

  }
  render() {
    this.calculateFractalLimit()
    const arr = new Uint8ClampedArray(this.width*this.height*4);
    // Iterate through every pixel
    let colorScale = 255/this.max_i;
    for (let i = 0; i < arr.length; i += 4) {
      let iter = this.escapeAlgorithm(i/4)*colorScale;
      arr[i] = iter;    // R value
      arr[i + 1] = iter;  // G value
      arr[i + 2] = iter;    // B value
      arr[i + 3] = 255;  // A value
    }
    return {
      arr,
      width: this.width,
      height: this.height
    }
  }
}

export default MandelbrotRenderer;