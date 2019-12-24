import React from 'react';
import PropTypes from 'prop-types';
import './FractalViewer.css';
import Renderer from '../../Renderer';
import Rectangle from '../../utils/Rectangle';
import idGenerator from '../../utils/IDGenerator';
import round from '../../utils/Round';
import JuliaPin from '../../JuliaPin';
import FractalType from '../../utils/FractalType';
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
    this.callBackMouse = undefined;
    this.renderID = undefined;
    this.showCentreMarker = props.showCentreMarker;
    this.updateDimensions = this.updateDimensions.bind(this);
    this.zoomTimeout = undefined;
    this.activeTouches = {};
    this.canvasZoom = 1;
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
    this.renderMode = props.renderMode;
    this.maxi = props.maxi;
    this.juliaPin = new JuliaPin(this.width / 2, this.height / 2, 10);
    this.draggingPin = false;
    this.renderer = new Renderer(
      props.type,
      parseInt(props.renderMode, 10),
      this.width,
      this.height,
      parseInt(props.maxi, 10),
      this.juliaPoint,
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
    if (nextProps.juliaPoint !== this.renderer.juliaPoint && this.type === FractalType.JULIA) {
      this.renderer.juliaPoint = nextProps.juliaPoint;
      return true;
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
    this.activeTouches[identifier] = { pageX, pageY };
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
      this.renderer.render(this.type).then((fractal) => {
        this.rendering = false;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        this.canvasZoom = 1;
        this.putImage(fractal.arr, fractal.width, fractal.height);
        this.dirty = false;
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
    newCanvas.getContext('2d').putImageData(this.imageData, this.deltaX, this.deltaY);
    fractalContext.scale(this.canvasZoom, this.canvasZoom);
    fractalContext.translate(this.originX, this.originY);
    fractalContext.drawImage(newCanvas, 0, 0);
    fractalContext.setTransform(1, 0, 0, 1, 0, 0);
    if (this.showCentreMarker) {
      fractalContext.fillStyle = '#00ff00';
      fractalContext.fillRect(this.width / 2 - 5, this.height / 2 - 5, 10, 10);
    }
    if (this.type === FractalType.MANDELBROT) {
      this.juliaPin.render(fractalContext);
    }
  }

  updateWidthHeight() {
    if (window.screen.orientation.type) {
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
      this.updateCanvas();
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
        this.updateCanvas();
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
      if (this.draggingPin) {
        console.log('update Julia');
        const worldJulia = this.coordsToWorld(this.juliaPin.x, this.juliaPin.y);
        this.updateJuliaPoint([worldJulia.x, worldJulia.y]);
        this.updateCanvas();
        this.draggingPin = false;
        return;
      }
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
        this.renderer.zoomOnPoint(this.canvasZoom, this.callBackMouse[0], this.callBackMouse[1]);
        this.originX = 0;
        this.originY = 0;
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
  }

  handleTouchMove(evt) {
    const touches = evt.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      if (this.dragging) {
        const startTouch = this.activeTouches[touches[i].identifier];
        this.deltaX = Math.floor(touches[i].pageX - startTouch.pageX);
        this.deltaY = Math.floor(touches[i].pageY - startTouch.pageY);
        this.mouseX = this.deltaX + this.width / 2;
        this.mouseY = this.deltaY + this.height / 2;
        const coords = this.mouseToWorld();
        this.updateCoords(coords.x.toFixed(5), coords.y.toFixed(5));
        requestAnimationFrame(() => this.updateCanvas());
      }
    }
  }

  handleTouchEnd(evt) {
    const touches = evt.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      delete this.activeTouches[touches[i].identifier];
    }
    this.handleDragEnd();
  }

  resetZoomAndRender() {
    if (!this.dragging || !this.dirty) {
      this.renderer.zoomOnPoint(this.canvasZoom, this.callBackMouse[0], this.callBackMouse[1]);
      this.dirty = true;
      this.originX = 0;
      this.originY = 0;
      this.canvasZoom = 1;
      this.drawFractal();
    }
  }

  zoom(direction) {
    this.dirty = true;
    let newCanvasZoom = this.canvasZoom + 0.02 * -1 * Math.sign(direction);
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
    this.callBackMouse = [this.mouseX, this.mouseY];
    clearTimeout(this.zoomTimeout);
    this.zoomTimeout = setTimeout(() => {
      this.resetZoomAndRender();
    }, 1000);
    this.canvasZoom = newCanvasZoom;
    requestAnimationFrame(() => this.updateCanvas());
  }

  handleScroll(e) {
    this.zoom(e.deltaY);
  }

  render() {
    const p = this.props;
    this.renderer.maxIter = p.maxi;
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
  type: PropTypes.string.isRequired,
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
};

FractalViewer.defaultProps = {
  showCentreMarker: false,
  juliaPoint: [0, 0],
  updateJuliaPoint: (() => [0, 0]),
};
export default FractalViewer;
