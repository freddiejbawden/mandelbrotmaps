import React from 'react';
import Timer from '../Timer';
import Settings from '../Settings';
import './MandelbrotViewer.css';
import Renderer from '../../Renderer';

class MandelbrotViewer extends React.Component {
  constructor(props) {
    const p = props;
    super(p);
    this.fractal = React.createRef();
    this.timer = React.createRef();
    this.last_arr = undefined;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // Set up hooks for Setting Component
    this.updateDimensions = this.updateDimensions.bind(this);
    this.updateIter = this.updateIter.bind(this);
    this.updateRenderMethod = this.updateRenderMethod.bind(this);
    this.updateCentreCoords = this.updateCentreCoords.bind(this);
    this.updatePixelSize = this.updatePixelSize.bind(this);
    this.zoomTimeout = undefined;
    this.state = {};
    this.renderer = new Renderer(
      p.renderMode,
      window.innerWidth,
      window.innerHeight,
      parseInt(p.maxi, 10),
    );
  }

  async componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    window.performance.mark('fractal_rendered_start');
    this.drawFractal();
    window.performance.mark('fractal_rendered_end');
    window.performance.measure('fractal_render_time', 'fractal_rendered_start', 'fractal_rendered_end');
  }

  componentDidUpdate() {
    this.drawFractal();
  }

  updateIter(iter) {
    let i;
    if (!iter) {
      i = 100;
    } else {
      i = iter;
    }
    this.renderer.max_i = parseInt(i, 10);
    this.drawFractal();
  }

  updateRenderMethod(renderMode) {
    this.renderer.mode = parseInt(renderMode, 10);
    this.drawFractal();
  }

  updatePixelSize(px) {
    this.renderer.pixelSize = px;
    this.drawFractal();
  }

  updateCentreCoords(x, y) {
    this.renderer.updateCentreCoords(x, y);
    this.drawFractal();
  }

  drawFractal() {
    const timerStart = Date.now();
    this.renderer.render().then((fractal) => {
      const fractalContext = this.fractal.current.getContext('2d');
      fractalContext.canvas.width = window.innerWidth;
      fractalContext.canvas.height = window.innerHeight;
      const imageData = fractalContext.createImageData(fractal.width, fractal.height);
      imageData.data.set(fractal.arr);
      this.last_arr = fractal.arr;
      fractalContext.putImageData(imageData, 0, 0);
      this.timer.current.updateTime(Date.now() - timerStart);
    }).catch((err) => {
      // TODO: notify user
      // eslint-disable-next-line no-console
      console.error(err);
    });
  }

  updateDimensions() {
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => {
      this.renderer.width = window.innerWidth;
      this.renderer.height = window.innerHeight;
      this.drawFractal();
    }, 100);
  }

  /*  handleClick(e) {
      // in case of a wide border, the boarder-width needs to be considered in the formula above
      // this.centreCoords = [-1,-1];
      // this.drawFractal()
    }
  */

  render() {
    const s = this.state;
    if (!s.renderMode) {
      s.renderMode = undefined;
    }
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
            maxi={s.max_i}
          />
        </div>
        <canvas className="fractal" id="fractal" ref={this.fractal} />
      </div>
    );
  }
}

export default MandelbrotViewer;
