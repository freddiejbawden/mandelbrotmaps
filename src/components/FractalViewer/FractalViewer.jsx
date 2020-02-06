import React from 'react';
import PropTypes from 'prop-types';
import './FractalViewer.css';
import { Icon } from 'semantic-ui-react';
import Renderer from '../../Renderer';
import Rectangle from '../../utils/Rectangle';
import idGenerator from '../../utils/IDGenerator';
import round from '../../utils/Round';
import JuliaPin from '../../JuliaPin';
import FractalType from '../../utils/FractalType';
import distance, { centre } from '../../utils/TouchUtils';
import { withStore } from '../../statemanagement/createStore';
import Mode from '../../Renderer/RenderMode';
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
    this.showFocus = props.store.focusHighlight;
    this.shiftPressed = false;
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

    // does not exist under test
    if (props.store) {
      if (props.store.stats) {
        this.focus = props.store.stats.focus.value;
      }
    }
    this.dragging = false;
    this.deltaX = 0;
    this.deltaY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.keysDown = {
      37: false,
      38: false,
      39: false,
      40: false,
    };
    this.dirty = false;
    this.renderID = undefined;
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
    this.type = props.type;
    this.zoomLevel = 1;
    this.juliaShiftX = 0;
    this.juliaShiftY = 0;
    this.previousLength = -1;
    this.renderMode = props.store.renderMode;
    this.juliaPin = new JuliaPin(this.width / 2, this.height / 2, 20);
    this.draggingPin = false;
    this.renderer = new Renderer(
      props.type,
      parseInt(this.renderMode, 10),
      this.width,
      this.height,
      parseInt(props.store.maxIter, 10),
      [-1, 0],
    );
    this.previousIterations = props.store.customIterations;
    this.previousOverride = props.store.overrideIterations;
  }

  async componentDidMount() {
    this.fractal.current.focus();
    // await this.loadWasm();

    // Safari support
    document.addEventListener('gesturechange', (e) => {
      const p = this.props;
      const { store } = p;
      if (store.stats.focus.value === this.position && !this.rendering) {
        if (this.previousLength === -1) {
          this.previousLength = e.scale;
        }
        let magnification = Math.abs((e.scale - this.previousLength));
        if (magnification > 0.02) {
          magnification = 0.02;
        }
        if (e.scale > this.previousLength) this.zoom(-1, magnification);
        if (e.scale < this.previousLength) this.zoom(1, magnification);
        this.previousLength = e.scale;
      }
    });
    window.addEventListener('resize', this.updateDimensions);
    requestAnimationFrame(() => {
      this.drawFractal();
    });

    // accessibility fallback for keyboard
    document.addEventListener('keydown', async (e) => {
      // TODO: change focus to be both regular and stat
      if (this.focus === this.type) {
        // + key
        if (e.keyCode === 61) {
          await this.zoom(-1, 0.05, true);
        }
        // - key
        if (e.keyCode === 173) {
          await this.zoom(1, 0.05, true);
        }
        // Arrow keys have keycodes 37 -> 40
        if (e.keyCode === 16) {
          this.shiftPressed = true;
        }
        if (e.keyCode >= 37 && e.keyCode <= 40 && !this.dirty) {
          const movement = 5;
          this.dragging = true;
          this.keysDown[e.keyCode] = true;
          if (this.shiftPressed) {
            this.draggingPin = true;
            const newX = this.juliaPin.x + this.keysDown[37] * -1 * movement
              + this.keysDown[39] * movement;
            const newY = this.juliaPin.y + this.keysDown[38] * -1 * movement
              + this.keysDown[40] * movement;
            this.moveJulia(newX, newY);
          } else {
            this.deltaX += this.keysDown[37] * movement + this.keysDown[39] * -1 * movement;
            this.deltaY += this.keysDown[38] * movement + this.keysDown[40] * -1 * movement;
            await this.safeUpdate();
          }
        }
      }
    });
    document.addEventListener('keyup', async (e) => {
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        this.keysDown[e.keyCode] = false;
        await this.handleDragEnd();
      }
      if (e.keyCode === 16) {
        this.shiftPressed = false;
      }
    });
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.store.forceUpdate === this.type) {
      this.drawFractal();
      return false;
    }
    if (nextProps.store.focusHighlight !== this.focusHighlight) {
      this.focusHighlight = nextProps.store.focusHighlight;
      return true;
    }
    if (nextProps.store.resetFractal) {
      this.reset();
      return false;
    }
    if (nextProps.store.stats.focus.value !== this.focus) {
      this.focus = nextProps.store.stats.focus.value;
      return true;
    }
    if (nextProps.store.showRenderTrace !== this.renderer.showRenderTrace) {
      this.renderer.showRenderTrace = nextProps.store.showRenderTrace;
      this.drawFractal();
      return false;
    }
    if (nextProps.store.centreJulia) {
      if (this.type === FractalType.MANDELBROT) this.centreJulia();
      return false;
    }
    if (this.renderMode !== nextProps.store.renderMode) {
      this.renderMode = nextProps.store.renderMode;
      this.renderer.mode = nextProps.store.renderMode;
      this.drawFractal();
      return false;
    }
    if (
      this.previousIterations !== nextProps.store.customIterations
      && nextProps.store.overrideIterations) {
      this.previousIterations = nextProps.store.customIterations;
      this.drawFractal();
      return false;
    }
    if (this.previousOverride !== nextProps.store.overrideIterations) {
      this.previousOverride = nextProps.store.overrideIterations;
      this.drawFractal();
      return false;
    }
    if (this.type === FractalType.JULIA && !this.rendering) {
      if (nextProps.store.juliaPoint !== this.renderer.juliaPoint
        || nextProps.store.mandelDragging !== this.mandelbrotDragging) {
        this.renderer.juliaPoint = nextProps.store.juliaPoint;
        this.mandelbrotDragging = nextProps.store.mandelDragging;
        this.drawFractal();
        return false;
      }
    }
    return false;
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
      const p = this.props;
      if (p.store.renderMode === Mode.WASM || p.store.renderMode === Mode.WASMMT) {
        requestAnimationFrame(() => this.drawFractal());
      }
    } catch (err) {
      // TODO: notify user
      // eslint-disable-next-line no-console
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  };

  centreJulia() {
    const p = this.props;
    const st = p.store;
    const newX = this.width / 2;
    const newY = this.height / 2;
    const newPos = this.coordsToWorld(newX, newY);
    this.juliaPin.move(newX, newY);
    st.set({
      centreJulia: false,
      juliaPoint: [newPos.x, newPos.y],
    });
    requestAnimationFrame(() => this.updateCanvas());
  }

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

  reset() {
    this.zoomLevel = 1;
    const p = this.props;
    p.store.setStat({
      zoomLevel: round(this.zoomLevel, 2),
    });
    if (p.store.get('dualUpdateFlag')) {
      p.store.set({
        resetFractal: false,
        dualUpdateFlag: false,
      });
    } else {
      p.store.set({
        dualUpdateFlag: true,
      });
    }
    this.renderer.pixelSize = 0.004;
    this.renderer.centreCoords = [0, 0];
    this.centreJulia();
    requestAnimationFrame(() => this.drawFractal());
  }

  forceUpdate() {
    const p = this.props;
    p.store.set({
      forceUpdate: -1,
    });
    requestAnimationFrame(() => this.drawFractal());
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
    const iterationCalc = (zoom) => {
      const newIter = 54 * Math.exp(Math.abs(0.5 * Math.log10(zoom)));
      const p = this.props;
      const s = p.store;
      s.setStat({
        iterations: newIter,
      });
      return Math.floor(newIter);
    };
    this.updateWidthHeight();
    this.rendering = true;
    const startTime = Date.now();
    window.performance.mark('fractal_rendered_start');
    if (!this.dragging || !this.dirty) {
      let iterationCount;
      const p = this.props;
      const s = p.store;
      const iters = iterationCalc(this.zoomLevel);
      if (s.overrideIterations && !this.mandelbrotDragging) {
        iterationCount = s.customIterations;
      } else if (this.type === FractalType.MANDELBROT) {
        iterationCount = iters;
      } else if (this.mandelbrotDragging) {
        iterationCount = Math.min(100, iters / 2);
      } else {
        iterationCount = iters;
      }
      this.renderer.render(iterationCount, this.mandelbrotDragging).then((fractal) => {
        this.rendering = false;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        this.canvasZoom = 1;
        this.putImage(fractal.arr, fractal.width, fractal.height);
        window.performance.mark('fractal_rendered_end');
        window.performance.measure('fractal_render_time', 'fractal_rendered_start', 'fractal_rendered_end');
        // ${window.performance.getEntriesByName('fractal_render_time').pop().duration}`
        p.store.setStat({
          renderTime: (Date.now() - startTime),
        });
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
    if (this.type === FractalType.MANDELBROT) {
      const jRX = this.juliaShiftX * this.canvasZoom - this.juliaShiftX;
      const jRY = this.juliaShiftY * this.canvasZoom - this.juliaShiftY;
      this.juliaPin.render(
        fractalContext,
        jRX + this.deltaX,
        jRY + this.deltaY,
      );
    }
  }

  updateWidthHeight() {
    let newWidth;
    let newHeight;
    if (window.screen.orientation) {
      this.orientation = window.screen.orientation.type;
    } else {
      this.orientation = 'landscape-primary';
    }
    if (this.orientation === 'portrait-secondary' || this.orientation === 'portrait-primary' || (window.innerWidth < 800 && window.innerHeight > 600)) {
      this.orientation = 'portrait';
      newWidth = window.innerWidth;
      newHeight = Math.floor(window.innerHeight / 2);
    } else {
      this.orientation = 'landscape';
      newWidth = Math.floor(window.innerWidth / 2);
      newHeight = window.innerHeight;
    }

    // keep julia pin in correct location
    this.juliaPin.move(
      this.juliaPin.x + (newWidth - this.width) / 2,
      this.juliaPin.y + (newHeight - this.height) / 2,
    );
    this.width = newWidth;
    this.height = newHeight;
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
        // this can be unsafe, as we are rendering when this is called
        requestAnimationFrame(() => this.updateCanvas());
      }
    }
  }

  updateDimensions() {
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => {
      this.updateWidthHeight();
      requestAnimationFrame(() => this.drawFractal());
    }, 100);
  }

  handleClick() {
    if (this.type !== FractalType.JULIA) {
      // Make sure the Julia Pin can only be picked up by another fractal
      if (this.juliaPin.isClicked(this.mouseX, this.mouseY)) {
        this.draggingPin = true;
      }
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

  moveJulia(newX, newY) {
    const p = this.props;
    this.juliaPin.move(newX, newY);
    const worldJulia = this.coordsToWorld(this.juliaPin.x, this.juliaPin.y);
    if (!this.rendering) {
      p.store.set(
        {
          juliaPoint: [worldJulia.x, worldJulia.y],
          mandelDragging: true,
        },
      );
      requestAnimationFrame(() => this.safeUpdate());
    }
  }


  handleMouseMove(e) {
    // check if a key is pressed
    if (Object.values(this.keysDown).some((el) => el)) {
      return;
    }
    if (this.orientation === 'portrait') {
      this.mouseX = e.pageX;
      this.mouseY = e.pageY - this.height * this.position;
    } else {
      this.mouseX = e.pageX - this.width * this.position;
      this.mouseY = e.pageY;
    }
    const coords = this.mouseToWorld();
    const p = this.props;
    p.store.setStat({
      re: coords.x.toFixed(5),
      im: coords.y.toFixed(5),
    });
    if (this.dragging && !this.rendering) {
      if (this.draggingPin) {
        this.moveJulia(this.mouseX, this.mouseY);
      } else {
        this.deltaX += e.movementX;
        this.deltaY += e.movementY;
        this.safeUpdate();
      }
    }
  }

  safeUpdate() {
    if (!this.rendering) {
      this.updateCanvas();
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
        const p = this.props;
        p.store.set({
          juliaPin: [worldJulia.x, worldJulia.y],
          mandelDragging: false,
        });
        requestAnimationFrame(() => this.safeUpdate());
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
      const p = this.props;
      p.store.setStat({
        renderTime: (Date.now() - startTime),
      });
    }
  }


  handleTouchStart(e) {
    const touches = e.changedTouches;
    const p = this.props;
    p.store.setStat({
      focus: this.type,
    });
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
        const p = this.props;
        p.store.set({
          juliaPoint: [worldJulia.x, worldJulia.y],
          mandelDragging: true,
        });
        requestAnimationFrame(() => this.safeUpdate());
      } else {
        const startTouch = this.activeTouches[touches[0].identifier];
        this.deltaX = Math.floor(pageX - (startTouch.pageX));
        this.deltaY = Math.floor(pageY - startTouch.pageY);
        this.mouseX = pageX;
        this.mouseY = pageY;
        const coords = this.mouseToWorld();
        const p = this.props;
        p.store.setStat({
          re: coords.x.toFixed(5),
          im: coords.y.toFixed(5),
        });
        // do not request animation frame as we must finish this before the drag ends
        this.safeUpdate();
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

  async resetZoomAndRender() {
    if (!this.dragging || !this.dirty) {
      this.renderer.zoomOnPoint(
        this.canvasZoom / this.prevStepZoom,
        this.callBackMouse[0],
        this.callBackMouse[1],
      );
      const jRX = this.juliaShiftX * this.canvasZoom - this.juliaShiftX;
      const jRY = this.juliaShiftY * this.canvasZoom - this.juliaShiftY;
      this.juliaPin.move(this.juliaPin.x + jRX, this.juliaPin.y + jRY);
      await this.drawFractal();
      this.prevStepZoom = 1;
      this.previousLength = -1;
      this.originX = 0;
      this.originY = 0;
      this.canvasZoom = 1;
      this.dirty = false;
    }
  }


  zoom(direction, magnificationStep, centred) {
    if (this.rendering) {
      return;
    }
    const magnificationDelta = (magnificationStep < 0.05) ? magnificationStep : 0.1;
    const deltaZoom = magnificationDelta * -1 * Math.sign(direction);
    let newCanvasZoom = this.canvasZoom + deltaZoom;
    if (this.renderer.maximumPixelSize < this.renderer.pixelSize / newCanvasZoom) {
      return;
    }
    this.zoomLevel = (this.renderer.basePixelSize / (this.renderer.pixelSize / newCanvasZoom));
    if (this.zoomLevel < 0.5) {
      this.zoomLevel = 0.5;
      return;
    }
    const p = this.props;
    p.store.setStat({
      zoomLevel: round(this.zoomLevel, 2),
    });
    if (newCanvasZoom < 0.1) {
      newCanvasZoom = 0.1;
    }
    this.mouseX = (this.mouseX && !centred) ? this.mouseX : this.width / 2;
    this.mouseY = (this.mouseY && !centred) ? this.mouseY : this.height / 2;

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
    }, 300);
    this.canvasZoom = newCanvasZoom;
    this.juliaShiftX = this.juliaPin.x - this.callBackMouse[0];
    this.juliaShiftY = this.juliaPin.y - this.callBackMouse[1];
    this.dirty = true;
    requestAnimationFrame(() => this.safeUpdate());
  }

  handleScroll(e) {
    this.zoom(e.deltaY, Math.abs(e.deltaY) / 100);
  }

  render() {
    const p = this.props;
    let focus = '';
    if (this.focus === this.type && this.focusHighlight) {
      focus = (
        <Icon
          circular
          inverted
          name="eye"
          size="large"
          className="focusIcon"
          color="grey"
        />
      );
    }
    return (
      <div className="mandelbrot-viewer-container">
        <canvas
          onTouchStart={(e) => this.handleTouchStart(e)}
          onTouchMove={(e) => this.handleTouchMove(e)}
          onTouchEnd={(e) => this.handleTouchEnd(e)}
          onMouseDown={(e) => this.handleClick(e)}
          onMouseEnter={() => p.store.setStat({ focus: this.type })}
          onMouseMove={(e) => this.handleMouseMove(e)}
          onMouseUp={(e) => this.handleDragEnd(e)}
          onMouseLeave={(e) => this.handleDragEnd(e)}
          onWheel={(e) => this.handleScroll(e)}
          id={`fractal-${this.type}`}
          ref={this.fractal}
        />
        {focus}
      </div>
    );
  }
}
FractalViewer.propTypes = {
  type: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  appRef: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  juliaPoint: PropTypes.array,
  mandelDragging: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};

FractalViewer.defaultProps = {
  juliaPoint: [0, 0],
  mandelDragging: false,
  store: {},
};
export default withStore(FractalViewer);
