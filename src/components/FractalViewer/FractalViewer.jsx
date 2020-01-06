import React from 'react';
import PropTypes from 'prop-types';
import './FractalViewer.css';
import Renderer from '../../Renderer';
import RenderQuality from '../../Renderer/RenderQuality';
import Rectangle from '../../utils/Rectangle';
import idGenerator from '../../utils/IDGenerator';
import round from '../../utils/Round';
import JuliaPin from '../../JuliaPin';
import FractalType from '../../utils/FractalType';
import distance, { centre } from '../../utils/TouchUtils';
/*
  TODO:
    * Fix long zoom jump issue
    * Fix rapid move mouse after drag bug
*/

class FractalViewer extends React.Component {
  constructor(props) {
    super(props);

    // if running in headless then set default
    if (window.screen.orientation) {
      this.orientation = window.screen.orientation.type;
    } else {
      this.orientation = 'landscape-primary';
    }
    this.position = props.position;
    this.appRef = props.appRef;
    this.fractal = React.createRef();
    this.last_arr = undefined;
    if (this.orientation === 'portrait-secondary' || this.orientation === 'portrait-primary' || (window.innerWidth < 800 && window.innerHeight > 600)) {
      this.orientation = 'portrait';
      this.width = window.innerWidth;
      this.height = Math.floor(window.innerHeight / 2);
    } else {
      this.orientation = 'landscape';
      this.width = Math.floor(window.innerWidth / 2);
      this.height = window.innerHeight;
    }
    this.state = {};
    this.dragging = false;
    this.deltaX = 0;
    this.deltaY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.dirty = false;
    this.renderID = undefined;
    this.showCentreMarker = props.showCentreMarker;
    this.updateDimensions = this.updateDimensions.bind(this);
    this.zoomTimeout = undefined;
    this.activeTouches = {};
    this.canvasZoom = 1;
    this.callBackMouse = [0, 0];
    this.prevStepZoom = 1;
    this.originX = 0;
    this.originY = 0;
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;
    this.rendering = false;
    this.updateRenderTime = props.updateRenderTime;
    this.updateZoomLevel = props.updateZoomLevel;
    this.updateCoords = props.updateCoords;
    this.updateFocus = props.updateFocus;
    this.updateJuliaPoint = props.updateJuliaPoint;
    this.type = props.type;
    this.zoomLevel = 1;
    this.juliaShiftX = 0;
    this.juliaShiftY = 0;
    this.previousLength = -1;
    this.renderMode = props.renderMode;
    this.maxi = props.maxi;
    this.juliaPin = new JuliaPin(this.width / 2, this.height / 2, 20);
    this.draggingPin = false;
    this.renderer = new Renderer(
      props.type,
      parseInt(props.renderMode, 10),
      this.width,
      this.height,
      parseInt(props.maxi, 10),
      [-1, 0],
    );
  }

  async componentDidMount() {
    this.fractal.current.focus();
    await this.loadWasm();
    const startTime = Date.now();
    window.addEventListener('resize', this.updateDimensions);
    window.performance.mark('fractal_rendered_start');
    requestAnimationFrame(() => {
      this.drawFractal();
      window.performance.mark('fractal_rendered_end');
      this.endTime = Date.now() - startTime;
      window.performance.measure('fractal_render_time', 'fractal_rendered_start', 'fractal_rendered_end');
    });
  }

  shouldComponentUpdate(nextProps) {
    if (this.renderMode !== nextProps.renderMode) {
      this.renderMode = nextProps.renderMode;
      return true;
    }
    if (this.renderer.maxIter !== nextProps.maxi) {
      this.renderer.maxIter = nextProps.maxi;
      return true;
    }
    if (this.type === FractalType.JULIA) {
      if (nextProps.juliaPoint !== this.renderer.juliaPoint
        || nextProps.mandelDragging !== this.mandelbrotDragging) {
        this.renderer.juliaPoint = nextProps.juliaPoint;
        this.mandelbrotDragging = nextProps.mandelDragging;
        this.drawFractal();
        return false;
      }
    }
    return false;
  }

  componentDidUpdate() {
    const p = this.props;
    if (p.showCentreMarker !== this.showCentreMarker) {
      this.showCentreMarker = p.showCentreMarker;
    }
    this.renderer.mode = p.renderMode;
    requestAnimationFrame(() => this.drawFractal());
  }

  loadWasm = async () => {
    try {
      // eslint-disable-next-line import/no-unresolved
      const { Mandelbrot } = await import('mmap');
      const s = this.state;
      this.mandelbrot = Mandelbrot.new(
        this.width,
        this.height,
        this.fractalLimitX,
        this.fractalLimitY,
        this.pixelSize,
        s.maxIter,
      );
      if (s.renderMode === 'wasm') {
        requestAnimationFrame(() => this.drawFractal());
      }
    } catch (err) {
      // TODO: notify user
      // eslint-disable-next-line no-console
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  };

  addTouch({ identifier, pageX, pageY }) {
    let x;
    let y;
    if (this.orientation === 'portrait') {
      x = pageX;
      y = pageY - this.height * this.position;
    } else {
      x = pageX - this.width * this.position;
      y = pageY;
    }
    this.activeTouches[identifier] = {
      pageX: x,
      pageY: y,
    };
  }

  updateCentreMarker() {
    this.showCentreMarker = !this.showCentreMarker;
    this.drawFractal();
  }

  updateIter(iter) {
    let i;
    if (!iter) {
      i = 100;
    } else {
      i = iter;
    }
    this.renderer.maxIter = parseInt(i, 10);
    requestAnimationFrame(() => this.drawFractal());
  }

  updatePixelSize(px) {
    this.renderer.pixelSize = px;
    requestAnimationFrame(() => this.drawFractal());
  }

  drawFractal() {
    this.updateWidthHeight();
    this.rendering = true;
    const startTime = Date.now();
    if (!this.dragging || !this.dirty) {
      const level = (this.mandelbrotDragging) ? RenderQuality.LOW : RenderQuality.MAX;
      this.renderer.render(level).then((fractal) => {
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        this.canvasZoom = 1;
        this.putImage(fractal.arr, fractal.width, fractal.height);
        this.updateRenderTime(Date.now() - startTime);
      }).catch((err) => {
        // TODO: alert user
        // eslint-disable-next-line
        alert(`${this.props.type} Error when drawing fractal ${err}`);
      });
    }
  }

  updateCanvas() {
    const fractalContext = this.fractal.current.getContext('2d');
    fractalContext.fillStyle = '#000000';

    // define a reference canvas for the image
    const newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('width', this.imageData.width);
    newCanvas.setAttribute('height', this.imageData.height);
    fractalContext.fillRect(0, 0, this.width, this.height);
    newCanvas.getContext('2d').putImageData(this.imageData, this.deltaX / this.canvasZoom, this.deltaY / this.canvasZoom);
    fractalContext.scale(this.canvasZoom, this.canvasZoom);
    fractalContext.translate(this.originX, this.originY);
    fractalContext.drawImage(newCanvas, 0, 0);
    fractalContext.setTransform(1, 0, 0, 1, 0, 0);
    if (this.showCentreMarker) {
      fractalContext.fillStyle = '#00ff00';
      fractalContext.fillRect(this.width / 2 - 5, this.height / 2 - 5, 10, 10);
    }
    if (this.type === FractalType.MANDELBROT) {
      const jRX = this.juliaShiftX * this.canvasZoom - this.juliaShiftX;
      const jRY = this.juliaShiftY * this.canvasZoom - this.juliaShiftY;
      this.juliaPin.render(
        fractalContext,
        jRX + this.deltaX,
        jRY + this.deltaY,
      );
    }
    this.rendering = false;
  }

  updateWidthHeight() {
    if (window.screen.orientation) {
      this.orientation = window.screen.orientation.type;
    } else {
      this.orientation = 'landscape-primary';
    }
    if (this.orientation === 'portrait-secondary' || this.orientation === 'portrait-primary' || (window.innerWidth < 800 && window.innerHeight > 600)) {
      this.orientation = 'portrait';
      this.width = window.innerWidth;
      this.height = Math.floor(window.innerHeight / 2);
    } else {
      this.orientation = 'landscape';
      this.width = Math.floor(window.innerWidth / 2);
      this.height = window.innerHeight;
    }
    this.renderer.width = this.width;
    this.renderer.height = this.height;
  }

  putImage(arr, width, height) {
    if (width && height) {
      if (!this.dragging || !this.dirty) {
        const fractalContext = this.fractal.current.getContext('2d');
        this.updateWidthHeight();
        fractalContext.canvas.width = this.width;
        fractalContext.canvas.height = this.height;
        this.imageData = fractalContext.createImageData(width, height);
        this.imageData.data.set(arr);
        requestAnimationFrame(() => this.updateCanvas());
      }
    }
  }

  updateDimensions() {
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => {
      this.updateWidthHeight();
      this.renderer.width = this.width;
      this.renderer.height = this.height;
      requestAnimationFrame(() => this.drawFractal());
    }, 100);
  }

  handleClick() {
    if (this.juliaPin.isClicked(this.mouseX, this.mouseY)) {
      this.draggingPin = true;
      requestAnimationFrame(() => this.updateCanvas());
    }
    this.dragging = true;
  }

  coordsToWorld(x, y) {
    const limits = this.renderer.calculateFractalLimit();
    const worldX = limits.fractalLimitX + (this.renderer.pixelSize / this.canvasZoom) * x;
    const worldY = limits.fractalLimitY + (this.renderer.pixelSize / this.canvasZoom) * y;
    return { x: worldX, y: worldY };
  }

  mouseToWorld() {
    return this.coordsToWorld(this.mouseX, this.mouseY);
  }

  handleMouseMove(e) {
    if (this.orientation === 'portrait') {
      this.mouseX = e.pageX;
      this.mouseY = e.pageY - this.height * this.position;
    } else {
      this.mouseX = e.pageX - this.width * this.position;
      this.mouseY = e.pageY;
    }
    const coords = this.mouseToWorld();
    this.updateCoords(coords.x.toFixed(5), coords.y.toFixed(5));
    if (this.dragging) {
      if (this.draggingPin) {
        this.juliaPin.move(this.mouseX, this.mouseY);
        const worldJulia = this.coordsToWorld(this.juliaPin.x, this.juliaPin.y);
        this.updateJuliaPoint([worldJulia.x, worldJulia.y], true);
        requestAnimationFrame(() => this.updateCanvas());
      } else {
        this.deltaX += e.movementX;
        this.deltaY += e.movementY;
        requestAnimationFrame(() => this.updateCanvas());
      }
    }
  }

  async handleDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      this.deltaX = this.deltaX / this.canvasZoom;
      this.deltaY = this.deltaY / this.canvasZoom;
      if (this.draggingPin) {
        this.juliaPin.move(this.juliaPin.x - this.deltaX, this.juliaPin.y - this.deltaY);
        this.deltaX = 0;
        this.deltaY = 0;
        const worldJulia = this.coordsToWorld(this.juliaPin.x, this.juliaPin.y);
        this.draggingPin = false;
        this.updateJuliaPoint([worldJulia.x, worldJulia.y], false);
        requestAnimationFrame(() => this.updateCanvas());
        return;
      }
      const jRX = this.juliaShiftX * this.canvasZoom - this.juliaShiftX;
      const jRY = this.juliaShiftY * this.canvasZoom - this.juliaShiftY;
      this.juliaPin.move(
        this.juliaPin.x + jRX + this.deltaX * this.canvasZoom,
        this.juliaPin.y + jRY + this.deltaY * this.canvasZoom,
      );
      this.renderer.centreCoords[0] += -1 * this.deltaX * this.renderer.pixelSize;
      this.renderer.centreCoords[1] += -1 * this.deltaY * this.renderer.pixelSize;
      let xRect;
      let yRect;
      if (this.deltaX > 0) {
        xRect = new Rectangle(0, 0, this.deltaX, this.height);
      } else {
        xRect = new Rectangle(this.width + this.deltaX, 0, Math.abs(this.deltaX), this.height);
      }
      if (this.deltaY > 0) {
        yRect = new Rectangle(0, 0, this.width, this.deltaY, this.deltaY);
      } else {
        yRect = new Rectangle(0, this.height + this.deltaY, this.width, Math.abs(this.deltaY));
      }
      const roundID = idGenerator();
      this.renderID = roundID;
      const startTime = Date.now();
      const renderRange = async () => {
        const result = await this.renderer.renderRange(
          xRect,
          yRect,
          this.deltaX,
          this.deltaY,
        );
        if (result === []) {
          this.drawFractal();
        }
        if (this.renderID === roundID) {
          this.putImage(result.arr, result.width, result.height);
        }
      };

      if (this.dirty) {
        this.renderer.zoomOnPoint(
          this.canvasZoom / this.prevStepZoom,
          this.callBackMouse[0],
          this.callBackMouse[1],
        );
        this.originX = 0;
        this.originY = 0;
        this.previousLength = -1;
        this.prevStepZoom = 1;
        this.canvasZoom = 1;
        await this.drawFractal();
      } else {
        await renderRange();
      }
      this.dragging = false;
      this.deltaX = 0;
      this.deltaY = 0;
      this.updateRenderTime(Date.now() - startTime);
    }
  }


  handleTouchStart(e) {
    const touches = e.changedTouches;
    this.updateFocus(this.type);
    if (touches.length > 0) {
      this.dragging = true;
    }
    for (let i = 0; i < touches.length; i += 1) {
      this.addTouch(touches[i]);
    }
    if (Object.keys(this.activeTouches).length === 1) {
      this.mouseX = touches[0].pageX - this.width * this.position;
      this.mouseY = touches[0].pageY - this.width * this.position;
    }
    this.handleClick();
  }

  touchPan(touches) {
    if (this.dragging) {
      let pageX;
      let pageY;
      if (this.orientation === 'portrait') {
        pageX = touches[0].pageX;
        pageY = touches[0].pageY - this.height * this.position;
      } else {
        pageX = touches[0].pageX - this.width * this.position;
        pageY = touches[0].pageY;
      }
      if (this.draggingPin) {
        this.juliaPin.move(pageX, pageY);
        const worldJulia = this.coordsToWorld(this.juliaPin.x, this.juliaPin.y);
        this.updateJuliaPoint([worldJulia.x, worldJulia.y], true);
        requestAnimationFrame(() => this.updateCanvas());
      } else {
        const startTouch = this.activeTouches[touches[0].identifier];
        this.deltaX = Math.floor(pageX - (startTouch.pageX));
        this.deltaY = Math.floor(pageY - startTouch.pageY);
        this.mouseX = pageX;
        this.mouseY = pageY;
        const coords = this.mouseToWorld();
        this.updateCoords(coords.x.toFixed(5), coords.y.toFixed(5));
        requestAnimationFrame(() => this.updateCanvas());
      }
    }
  }

  touchZoom() {
    const keys = Object.keys(this.activeTouches);
    const touch1 = this.activeTouches[keys[0]];
    const touch2 = this.activeTouches[keys[1]];
    const currentLength = distance(touch1, touch2);
    if (this.previousLength) {
      this.centerPoint = centre(touch1, touch2);
      this.mouseX = this.centerPoint.x;
      this.mouseY = this.centerPoint.y;
      if (this.previousLength === -1) {
        this.previousLength = currentLength;
      }
      const magnification = Math.abs((currentLength - this.previousLength) * 0.02);
      if (currentLength > this.previousLength) this.zoom(-1, magnification);
      if (currentLength < this.previousLength) this.zoom(1, magnification);
    }
    this.previousLength = currentLength;
  }

  handleTouchMove(evt) {
    const touches = evt.changedTouches;

    const numTouches = Object.keys(this.activeTouches).length;
    if (numTouches === 2) {
      for (let i = 0; i < touches.length; i += 1) {
        this.addTouch(touches[i]);
      }
      this.touchZoom();
    } else if (numTouches === 1) {
      this.touchPan(touches);
    }
  }

  handleTouchEnd(evt) {
    const touches = evt.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      delete this.activeTouches[touches[i].identifier];
    }
    if (Object.keys(this.activeTouches).length === 0) {
      this.handleDragEnd();
    }
  }

  resetZoomAndRender() {
    if (!this.dragging || !this.dirty) {
      this.renderer.zoomOnPoint(
        this.canvasZoom / this.prevStepZoom,
        this.callBackMouse[0],
        this.callBackMouse[1],
      );
      const jRX = this.juliaShiftX * this.canvasZoom - this.juliaShiftX;
      const jRY = this.juliaShiftY * this.canvasZoom - this.juliaShiftY;
      this.juliaPin.move(this.juliaPin.x + jRX, this.juliaPin.y + jRY);
      this.dirty = true;
      this.prevStepZoom = 1;
      this.previousLength = -1;
      this.originX = 0;
      this.originY = 0;
      this.canvasZoom = 1;
      this.drawFractal();
    }
  }

  zoom(direction, magnificationStep) {
    const magnificationDelta = magnificationStep || 0.02;
    const deltaZoom = magnificationDelta * -1 * Math.sign(direction);
    let newCanvasZoom = this.canvasZoom + deltaZoom;
    if (this.renderer.maximumPixelSize < this.renderer.pixelSize / newCanvasZoom) {
      return;
    }
    this.zoomLevel = (this.renderer.basePixelSize / (this.renderer.pixelSize / newCanvasZoom));
    this.updateZoomLevel(round(this.zoomLevel, 2));
    if (newCanvasZoom < 0.1) {
      newCanvasZoom = 0.1;
    }
    this.mouseX = (this.mouseX) ? this.mouseX : this.width / 2;
    this.mouseY = (this.mouseY) ? this.mouseY : this.height / 2;

    const centreX = this.mouseX;
    const centreY = this.mouseY;

    this.originX += centreX / newCanvasZoom - centreX / this.canvasZoom;
    this.originY += centreY / newCanvasZoom - centreY / this.canvasZoom;
    if (
      this.dirty
      && (this.callBackMouse[0] !== this.mouseX || this.callBackMouse[1] !== this.mouseY)
    ) {
      this.renderer.zoomOnPoint(
        newCanvasZoom / this.prevStepZoom,
        this.callBackMouse[0],
        this.callBackMouse[1],
      );
      this.prevStepZoom = newCanvasZoom;
    }
    this.callBackMouse = [this.mouseX, this.mouseY];

    clearTimeout(this.zoomTimeout);
    this.zoomTimeout = setTimeout(() => {
      this.juliaShiftX = this.juliaPin.x - this.callBackMouse[0];
      this.juliaShiftY = this.juliaPin.y - this.callBackMouse[1];
      this.resetZoomAndRender();
    }, 1000);
    this.canvasZoom = newCanvasZoom;
    this.juliaShiftX = this.juliaPin.x - this.callBackMouse[0];
    this.juliaShiftY = this.juliaPin.y - this.callBackMouse[1];
    this.dirty = true;
    requestAnimationFrame(() => this.updateCanvas());
  }

  handleScroll(e) {
    this.zoom(e.deltaY);
  }

  render() {
    return (
      <div className="mandelbrot-viewer-container">
        <canvas
          onTouchStart={(e) => this.handleTouchStart(e)}
          onTouchMove={(e) => this.handleTouchMove(e)}
          onTouchEnd={(e) => this.handleTouchEnd(e)}
          onMouseDown={(e) => this.handleClick(e)}
          onMouseEnter={() => this.updateFocus(this.type)}
          onMouseMove={(e) => this.handleMouseMove(e)}
          onMouseUp={(e) => this.handleDragEnd(e)}
          onMouseLeave={(e) => this.handleDragEnd(e)}
          onWheel={(e) => this.handleScroll(e)}
          className="fractal"
          id="fractal"
          ref={this.fractal}
        />
      </div>
    );
  }
}
FractalViewer.propTypes = {
  renderMode: PropTypes.number.isRequired,
  maxi: PropTypes.number.isRequired,
  showCentreMarker: PropTypes.bool,
  type: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
  updateRenderTime: PropTypes.func.isRequired,
  updateZoomLevel: PropTypes.func.isRequired,
  updateCoords: PropTypes.func.isRequired,
  updateJuliaPoint: PropTypes.func,
  updateFocus: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  appRef: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  juliaPoint: PropTypes.array,
  mandelDragging: PropTypes.bool,
};

FractalViewer.defaultProps = {
  showCentreMarker: false,
  juliaPoint: [0, 0],
  updateJuliaPoint: (() => [0, 0]),
  mandelDragging: false,
};
export default FractalViewer;
