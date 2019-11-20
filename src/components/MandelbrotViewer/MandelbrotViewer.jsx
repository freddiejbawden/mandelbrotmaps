import React from 'react';
import PropTypes from 'prop-types';
import Timer from '../Timer';
import Settings from '../Settings';
import './MandelbrotViewer.css';
import Renderer from '../../Renderer';
import Rectangle from '../../utils/Rectangle';

class MandelbrotViewer extends React.Component {
  constructor(props) {
    super(props);
    this.fractal = React.createRef();
    this.timer = React.createRef();
    this.last_arr = undefined;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.state = {};
    this.dragging = false;
    this.deltaX = 0;
    this.deltaY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    // Set up hooks for Setting Component
    this.updateDimensions = this.updateDimensions.bind(this);
    this.updateIter = this.updateIter.bind(this);
    this.updateRenderMethod = this.updateRenderMethod.bind(this);
    this.updateCentreCoords = this.updateCentreCoords.bind(this);
    this.updatePixelSize = this.updatePixelSize.bind(this);
    this.zoomTimeout = undefined;
    this.activeTouches = {};
    this.renderer = new Renderer(
      props.renderMode,
      window.innerWidth,
      window.innerHeight,
      parseInt(props.maxi, 10),
    );
  }

  async componentDidMount() {
    this.fractal.current.focus();
    await this.loadWasm();
    window.addEventListener('resize', this.updateDimensions);
    window.performance.mark('fractal_rendered_start');
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
    requestAnimationFrame(() => this.drawFractal());
    window.performance.mark('fractal_rendered_end');
    window.performance.measure('fractal_render_time', 'fractal_rendered_start', 'fractal_rendered_end');
  }

  componentDidUpdate() {
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

  updateRenderMethod(renderMode) {
    this.renderer.mode = parseInt(renderMode, 10);
    requestAnimationFrame(() => this.drawFractal());
  }

  updatePixelSize(px) {
    this.renderer.pixelSize = px;
    requestAnimationFrame(() => this.drawFractal());
  }

  updateCentreCoords(x, y) {
    this.renderer.updateCentreCoords(x, y);
    requestAnimationFrame(() => this.drawFractal());
  }

  drawFractal() {
    const timerStart = Date.now();
    this.renderer.render().then((fractal) => {
      this.putImage(fractal.arr, fractal.width, fractal.height);
      this.timer.current.updateTime(Date.now() - timerStart);
    }).catch((err) => {
      // TODO: alert user
      // eslint-disable-next-line no-alert
      alert(`Error when drawing fractal ${err}`);
    });
  }

  putImage(arr, width, height) {
    const fractalContext = this.fractal.current.getContext('2d');
    fractalContext.canvas.width = window.innerWidth;
    fractalContext.canvas.height = window.innerHeight;
    this.imageData = fractalContext.createImageData(width, height);
    this.arr = arr;
    this.imageData.data.set(arr);
    fractalContext.putImageData(this.imageData, 0, 0);
    fractalContext.fillRect(this.width / 2 - 5, this.height / 2 - 5, 10, 10);
  }

  updateImagePos() {
    if (!this.imageData) return;
    const fractalContext = this.fractal.current.getContext('2d');
    fractalContext.fillStyle = '#000000';
    fractalContext.fillRect(0, 0, this.width, this.height);
    fractalContext.putImageData(this.imageData, this.deltaX, this.deltaY);
    fractalContext.fillRect(
      (this.width) / 2 - 5 + this.deltaX,
      (this.height / 2) - 5 + this.deltaY,
      10,
      10,
    );
  }

  updateDimensions() {
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => {
      this.renderer.width = window.innerWidth;
      this.renderer.height = window.innerHeight;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      requestAnimationFrame(() => this.drawFractal());
    }, 100);
  }

  handleDragStart() {
    this.dragging = true;
  }

  handleMouseMove(e) {
    this.mouseX = e.pageX;
    this.mouseY = e.pageY;
    if (this.dragging) {
      this.deltaX += e.movementX;
      this.deltaY += e.movementY;
      this.updateImagePos();
    }
  }

  async handleDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      const timerStart = Date.now();
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
      const result = await this.renderer.renderRange(
        xRect,
        yRect,
        this.deltaX,
        this.deltaY,
      );
      this.dragging = false;
      this.deltaX = 0;
      this.deltaY = 0;
      this.putImage(result.arr, result.width, result.height);
      this.timer.current.updateTime(Date.now() - timerStart);
    }
  }

  handleTouchStart(e) {
    const touches = e.changedTouches;
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
        this.updateImagePos();
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

  handleKeyPress(e) {
    if (e.key === '=') {
      this.renderer.zoomOnPoint(0.05, this.mouseX, this.mouseY);
      requestAnimationFrame(() => this.drawFractal());
    } else if (e.key === '-') {
      this.renderer.zoomOnPoint(-0.05, this.mouseX, this.mouseY);
      requestAnimationFrame(() => this.drawFractal());
    }
  }

  render() {
    const s = this.state;
    return (
      <div className="mandelbrot-viewer-container">
        <div className="info-panel">
          <Timer time={this.time} ref={this.timer} />
          <Settings
            selectedRenderMode={s.renderMode}
            updatePixelSize={this.updatePixelSize}
            updateCentreCoords={this.updateCentreCoords}
            updateIter={this.updateIter}
            updateRenderMethod={this.updateRenderMethod}
            axi={s.maxIter}
          />
        </div>
        <canvas
          onTouchStart={(e) => this.handleTouchStart(e)}
          onTouchMove={(e) => this.handleTouchMove(e)}
          onTouchEnd={(e) => this.handleTouchEnd(e)}
          onMouseDown={(e) => this.handleDragStart(e)}
          onMouseMove={(e) => this.handleMouseMove(e)}
          onMouseUp={(e) => this.handleDragEnd(e)}
          onMouseLeave={(e) => this.handleDragEnd(e)}
          className="fractal"
          id="fractal"
          ref={this.fractal}
        />
      </div>
    );
  }
}
MandelbrotViewer.propTypes = {
  renderMode: PropTypes.number.isRequired,
  maxi: PropTypes.number.isRequired,
};
export default MandelbrotViewer;
