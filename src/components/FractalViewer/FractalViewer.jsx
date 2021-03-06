/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import './FractalViewer.css';
import { Icon } from 'semantic-ui-react';
import Draggable from 'react-draggable';
import Renderer from '../../Renderer';
import Rectangle from '../../utils/Rectangle';
import idGenerator from '../../utils/IDGenerator';
import round from '../../utils/Round';
import JuliaPin from '../../JuliaPin';
import FractalType from '../../utils/FractalType';
import distance, { centre } from '../../utils/TouchUtils';
import { withStore } from '../../statemanagement/createStore';
import Mode from '../../Renderer/RenderMode';
import LoaderPopUp from './LoaderPopUp/LoaderPopUp';
import Dragger from './Dragger.png';
import ColorMode from '../../Renderer/ColorOptions';
import ViewOptions from '../../utils/ViewOptions';


/**
 * Component for displaying the fractal
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
    this.showFocus = props.focusHighlight;
    this.shiftPressed = false;
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
    this.focus = props.focus;
    this.container = React.createRef();
    this.dragging = false;
    this.deltaX = 0;
    this.deltaY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.paddingAmount = 10;
    this.keysDown = {
      37: false,
      38: false,
      39: false,
      40: false,
    };
    this.state = {
      showSpinner: false,
    };
    this.dirty = false;
    this.renderID = undefined;
    this.updateDimensionsTimer = this.updateDimensionsTimer.bind(this);
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
    this.lastMouse = [];
    this.juliaShiftX = 0;
    this.juliaShiftY = 0;
    this.zoomPointX = null;
    this.zoomPointY = null;
    this.previousLength = -1;
    this.renderMode = props.renderMode;
    this.draggingPin = false;
    this.showJuliaPin = props.showJuliaPin;
    this.renderer = new Renderer(
      props.type,
      parseInt(this.renderMode, 10),
      this.width,
      this.height,
      parseInt(props.maxIter, 10),
      props.juliaPoint,
      props.coloringMode,
      props.store.nChunks,
    );
    if (this.type === FractalType.MANDELBROT) {
      this.renderer.centreCoords = props.mandelbrotCentre;
      this.renderer.pixelSize = props.mandelbrotZoom;
    }
    if (this.type === FractalType.JULIA && props.juliaCentre) {
      this.renderer.centreCoords = props.juliaCentre;
      this.renderer.pixelSize = props.juliaZoom;
    }
    this.zoomLevel = (this.renderer.basePixelSize / this.renderer.pixelSize);
    const jpointWorld = this.worldToCoords(props.juliaPoint[0], props.juliaPoint[1]);
    this.juliaPin = new JuliaPin(jpointWorld[0], jpointWorld[1], 20);
    this.customIterations = -1;
    this.previousOverride = props.overrideIterations;
  }

  async componentDidMount() {
    if (this.fractal.current) {
      this.fractal.current.focus();
    }
    // Safari support
    document.addEventListener('gesturechange', (e) => {
      if (this.focus === this.type && !this.rendering) {
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
    window.addEventListener('resize', this.updateDimensionsTimer);
    // accessibility fallback for keyboard
    document.addEventListener('keydown', async (e) => {
      // TODO: change focus to be both regular and stat
      if (this.focus === this.type) {
        // + key
        if (e.keyCode === 61 || e.keyCode === 187) {
          await this.zoom(-1, 0.05, true);
        }
        // - key
        if (e.keyCode === 173 || e.keyCode === 189) {
          await this.zoom(1, 0.05, true);
        }
        if (e.keyCode === 16) {
          this.shiftPressed = true;
        }
        // Arrow keys have keycodes 37 -> 40
        if (e.keyCode >= 37 && e.keyCode <= 40 && !this.dirty) {
          const movement = 5;
          this.dragging = true;
          this.keysDown[e.keyCode] = true;
          if (this.shiftPressed && this.focus === FractalType.MANDELBROT) {
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
    // wait for 300ms before triggering the end of the drag
    document.addEventListener('keyup', async (e) => {
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        this.keysDown[e.keyCode] = false;
        clearTimeout(this.keyupTimeout);
        this.keyupTimeout = setTimeout(() => {
          this.handleDragEnd();
        }, 300);
      }
      if (e.keyCode === 16) {
        this.shiftPressed = false;
      }
    });
    this.drawFractal();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const p = this.props;
    const st = this.state;
    if (st.showSpinner !== nextState.showSpinner) {
      return true;
    }
    if (nextProps.showJuliaPin !== this.showJuliaPin) {
      this.showJuliaPin = nextProps.showJuliaPin;
      this.drawFractal();
      return false;
    }
    if (nextProps.viewMode !== this.viewMode) {
      this.viewMode = nextProps.viewMode;
      this.changeView = true;
      return true;
    }
    if (nextProps.detatched !== p.detatched) {
      this.changeView = true;
      return true;
    }
    if (nextProps.hidden !== p.hidden) {
      this.changeView = true;
      return true;
    }
    if (nextProps.forceUpdate === this.type) {
      this.forceUpdate();
      return false;
    }
    if (nextProps.focusHighlight !== this.focusHighlight) {
      this.focusHighlight = nextProps.focusHighlight;
      return true;
    }
    if (nextProps.resetFractal) {
      this.reset();
      return false;
    }
    if (nextProps.focus !== this.focus) {
      this.focus = nextProps.focus;
      return true;
    }
    if (nextProps.coloringMode !== this.renderer.coloringMode) {
      this.renderer.coloringMode = nextProps.coloringMode;
      this.drawFractal();
    }
    if (nextProps.showRenderTrace !== this.renderer.showRenderTrace) {
      this.renderer.showRenderTrace = nextProps.showRenderTrace;
      this.drawFractal();
      return false;
    }
    if (nextProps.centreJulia) {
      if (this.type === FractalType.MANDELBROT) this.centreJulia();
      return false;
    }
    if (this.renderMode !== nextProps.renderMode) {
      this.renderMode = nextProps.renderMode;
      this.renderer.mode = nextProps.renderMode;
      this.drawFractal();
      return false;
    }
    if (
      this.customIterations !== nextProps.customIterations
      && this.previousOverride) {
      this.customIterations = nextProps.customIterations;
      this.drawFractal();
      return false;
    }
    if (this.previousOverride !== nextProps.overrideIterations) {
      this.previousOverride = nextProps.overrideIterations;
      this.drawFractal();
      return false;
    }
    if (this.type === FractalType.JULIA && !this.rendering) {
      if (nextProps.juliaPoint !== this.renderer.juliaPoint
        || nextProps.movingJuliaPin !== this.mandelbrotDragging) {
        this.renderer.juliaPoint = nextProps.juliaPoint;
        this.mandelbrotDragging = nextProps.movingJuliaPin;
        this.drawFractal();
        return false;
      }
    }
    return false;
  }

  componentDidUpdate() {
    if (this.changeView) {
      this.updateDimensions();
      this.changeView = false;
    }
  }

  /**
   * Get the pixel position relative to the fractal viewer
   * @param {*} pageX screen X position (pixels)
   * @param {*} pageY screen Y position (pixels)
   * @return {*} pixel position relative to the fractal viewer
   */
  getFractalPosition(pageX, pageY) {
    const rect = this.container.current.getBoundingClientRect();
    return [pageX - rect.x, pageY - rect.y];
  }

  /**
   * Set the mouse position
   * @param {*} pageX screen X position (pixels)
   * @param {*} pageY screen Y position (pixels)
   */
  getMouseViewerPosition(pageX, pageY) {
    const [x, y] = this.getFractalPosition(pageX, pageY);
    this.mouseX = x;
    this.mouseY = y;
  }

  /**
   * Load the WASM binary and set the bindings
   */
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
      if (p.renderMode === Mode.WASM || p.renderMode === Mode.WASMMT) {
        requestAnimationFrame(() => this.drawFractal());
      }
    } catch (err) {
      // TODO: notify user
      // eslint-disable-next-line no-console
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  };

  /**
   * centre the Julia pin
   */
  centreJulia() {
    const p = this.props;
    const st = p.store;
    const newX = this.width / 2;
    const newY = this.height / 2;
    const newPos = this.coordsToWorld(newX, newY);
    this.juliaPin.move(newX, newY);
    st.set({
      centreJulia: false,
      juliaPoint: newPos,
    });
    requestAnimationFrame(() => this.updateCanvas());
  }

  /**
   * Add touch to touches dictionary
   * @param {*} identifier touch identifier
   * @param {*} pageX screen X position (pixels)
   * @param {*} pageY screen Y position (pixels)
   */
  addTouch({ identifier, pageX, pageY }) {
    const [x, y] = this.getFractalPosition(pageX, pageY);
    this.activeTouches[identifier] = {
      pageX,
      pageY,
      fractalX: x,
      fractalY: y,
    };
  }

  /**
   * Reset the fractal zoom and re-render
   */
  reset() {
    this.zoomLevel = 1;
    const p = this.props;
    p.store.setStat({
      zoomLevel: round(this.zoomLevel, 2),
    });
    if (p.dualUpdateFlag) {
      p.store.set({
        resetFractal: false,
        dualUpdateFlag: false,
      });
    } else {
      p.store.set({
        dualUpdateFlag: true,
      });
    }
    this.renderer.pixelSize = 0.008;
    this.renderer.centreCoords = [0, 0];
    this.centreJulia();
    requestAnimationFrame(() => this.drawFractal());
  }

  /**
   * Re draw the fractal
   */
  forceUpdate() {
    const p = this.props;
    p.store.set({
      forceUpdate: -1,
    });
    requestAnimationFrame(() => this.drawFractal());
  }

  /**
   * Render the fractal
   */
  drawFractal() {
    /**
     * Calculate the iteration count
     * @param {*} zoom
     */
    const iterationCalc = (zoom) => {
      const newIter = 54 * Math.exp(Math.abs(0.2 * Math.log(zoom)));
      const p = this.props;
      const s = p.store;
      s.setStat({
        iterations: Math.floor(newIter),
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
      // Check if we should override the iterations
      if (this.previousOverride && !this.mandelbrotDragging) {
        iterationCount = this.customIterations;
      } else {
        const iters = iterationCalc(this.zoomLevel);
        if (this.type === FractalType.MANDELBROT) {
          iterationCount = iters;
        } else if (this.mandelbrotDragging) {
          // if we are dargging the Julia pin, half the iterations
          iterationCount = Math.min(100, iters / 2);
        } else {
          iterationCount = iters;
        }
      }
      // Show spinner after 1000ms
      clearTimeout(this.spinnerTimeout);
      this.spinnerTimeout = setTimeout(() => {
        this.setState({
          showSpinner: true,
        });
      }, 1000);
      this.renderer.render(iterationCount, this.mandelbrotDragging).then((fractal) => {
        this.rendering = false;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        this.canvasZoom = 1;
        this.putImage(fractal.arr, fractal.width, fractal.height);
        window.performance.mark('fractal_rendered_end');
        window.performance.measure('fractal_render_time', 'fractal_rendered_start', 'fractal_rendered_end');
        p.store.setStat({
          renderTime: (Date.now() - startTime),
        });
        clearTimeout(this.spinnerTimeout);

        this.setState({
          showSpinner: false,
        });
      }).catch((err) => {
        // TODO: alert user
        // eslint-disable-next-line
        alert(`${this.props.type} Error when drawing fractal ${err}`);
      });
    }
  }

  /**
   * Update the canvas putting the fractal image
   */
  updateCanvas() {
    if (this.fractal.current === null || this.fractal.current === undefined) return;
    const fractalContext = this.fractal.current.getContext('2d');
    if (!fractalContext) return;
    fractalContext.fillStyle = '#787878';

    // define a reference canvas for the image
    const newCanvas = document.createElement('canvas');
    if (this.imageData === undefined) return;
    newCanvas.setAttribute('width', this.imageData.width);
    newCanvas.setAttribute('height', this.imageData.height);
    fractalContext.fillRect(0, 0, this.width, this.height);
    newCanvas.getContext('2d').putImageData(this.imageData, this.deltaX / this.canvasZoom, this.deltaY / this.canvasZoom);
    fractalContext.scale(this.canvasZoom, this.canvasZoom);
    fractalContext.translate(this.originX, this.originY);
    fractalContext.drawImage(newCanvas, 0, 0);
    fractalContext.setTransform(1, 0, 0, 1, 0, 0);
    if (this.type === FractalType.MANDELBROT && this.showJuliaPin) {
      this.juliaPin.enable();
      const jRX = this.juliaShiftX * this.canvasZoom - this.juliaShiftX;
      const jRY = this.juliaShiftY * this.canvasZoom - this.juliaShiftY;
      this.juliaPin.render(
        fractalContext,
        jRX + this.deltaX,
        jRY + this.deltaY,
      );
    } else {
      this.juliaPin.disable();
    }
  }

  /**
   * Update the width and height of the fractal viewer
   */
  updateWidthHeight() {
    const newWidth = this.container.current.clientWidth;
    // This is due to a stupid bug which I will fix SoonTM
    const newHeight = this.container.current.clientHeight - 5;
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

  /**
   * Convert the RGBA array to an image and display it
   * @param {*} arr 1D RGBA array
   * @param {*} width width of the image
   * @param {*} height height of the iamge
   */
  putImage(arr, width, height) {
    if (width && height) {
      if (!this.dragging || !this.dirty) {
        if (this.fractal.current === null || this.fractal.current === undefined) return;
        const fractalContext = this.fractal.current.getContext('2d');
        fractalContext.canvas.width = this.width;
        fractalContext.canvas.height = this.height;
        this.imageData = fractalContext.createImageData(width, height);
        this.imageData.data.set(arr);
        // this can be unsafe, as we are rendering when this is called
        requestAnimationFrame(() => this.updateCanvas());
      }
    }
  }

  /**
   * Update the fractal canvas size
   */
  updateDimensions() {
    if (this.fractal.current === null || this.fractal.current === undefined) return;
    this.fractal.current.setAttribute('width', 'auto');
    this.fractal.current.setAttribute('height', 'auto');
    requestAnimationFrame(() => this.drawFractal());
  }

  /**
   * Update the dimensions after 100ms of no resizing
   */
  updateDimensionsTimer() {
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => {
      this.updateDimensions();
      requestAnimationFrame(() => this.drawFractal());
    }, 100);
  }

  /**
   * Jump Zoom
   */
  async easeInOutZoom() {
    let count = 0;
    // eslint-disable-next-line no-param-reassign
    const easeInOutQuad = (t) => {
      const tminus = t - 1;
      return tminus * t * t + 1;
    };
    const interval = setInterval(() => {
      if (count >= 10) {
        clearInterval(interval);
      }
      this.zoom(-1, easeInOutQuad(count / 10) / 2, false);
      count += 1;
    }, 15);
  }

  async handleMouseDown() {
    if (!this.rendering && !this.zooming) {
      if (this.type !== FractalType.JULIA) {
        // Make sure the Julia Pin can only be picked up by another fractal
        if (this.juliaPin.isClicked(this.mouseX, this.mouseY)) {
          this.draggingPin = true;
        }
      }
      this.dragging = true;
    }
  }

  handleMouseUp(e) {
    if (!this.rendering) {
      this.handleDragEnd(e);
    }
  }

  /**
   * Convert the screen coordinates to world coordinatess
   * @param {*} x
   * @param {*} y
   */
  coordsToWorld(x, y) {
    const limits = this.renderer.calculateFractalLimit();
    const worldX = limits.fractalLimitX + (this.renderer.pixelSize / this.canvasZoom) * x;
    const worldY = limits.fractalLimitY + (this.renderer.pixelSize / this.canvasZoom) * y;
    return [worldX, worldY];
  }

  /**
   * Convert world position to screen position
   * @param {*} worldX
   * @param {*} worldY
   */
  worldToCoords(worldX, worldY) {
    const limits = this.renderer.calculateFractalLimit();
    const x = ((worldX - limits.fractalLimitX) * this.canvasZoom) / this.renderer.pixelSize;
    const y = ((worldY - limits.fractalLimitY) * this.canvasZoom) / this.renderer.pixelSize;
    return [x, y];
  }

  /**
   * Convert mouse position to world position
   */
  mouseToWorld() {
    return this.coordsToWorld(this.mouseX, this.mouseY);
  }

  /**
   * Move the Julia Pin to a new position
   * @param {*} newX
   * @param {*} newY
   */
  moveJulia(newX, newY) {
    const p = this.props;
    this.juliaPin.move(newX, newY);
    const worldJulia = this.coordsToWorld(this.juliaPin.x, this.juliaPin.y);
    if (!this.rendering) {
      p.store.set(
        {
          juliaPoint: worldJulia,
          movingJuliaPin: true,
        },
      );
      requestAnimationFrame(() => this.safeUpdate());
    }
  }

  handleMouseMove(e) {
    e.preventDefault();
    if (e.pageX && e.pageY) {
      this.getMouseViewerPosition(e.pageX, e.pageY);
    }
    // check if a key is pressed
    if (Object.values(this.keysDown).some((el) => el)) {
      return;
    }
    const coords = this.mouseToWorld();
    const p = this.props;
    p.store.setStat({
      re: coords[0].toFixed(5),
      im: coords[1].toFixed(5),
    });
    if (this.dragging && !this.rendering) {
      if (this.draggingPin) {
        this.moveJulia(this.mouseX, this.mouseY);
      } else {
        this.deltaX += e.movementX;
        this.deltaY += e.movementY;
        this.imageOffsetX += e.movementX;
        this.imageOffsetY += e.movementY;
        this.safeUpdate();
      }
    }
  }

  /**
   * Check if we are rendering before updating
   */
  safeUpdate() {
    if (!this.rendering) {
      this.updateCanvas();
    }
  }

  /**
   * Render after drag ends
   */
  async handleDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      this.deltaX /= this.canvasZoom;
      this.deltaY /= this.canvasZoom;
      const p = this.props;
      if (this.draggingPin) {
        // Reset julia pin
        this.juliaPin.move(this.juliaPin.x - this.deltaX, this.juliaPin.y - this.deltaY);
        this.deltaX = 0;
        this.deltaY = 0;
        const worldJulia = this.coordsToWorld(this.juliaPin.x, this.juliaPin.y);
        this.draggingPin = false;
        p.store.set({
          juliaPin: worldJulia,
          movingJuliaPin: false,
        });
        requestAnimationFrame(() => this.safeUpdate());
        return;
      }
      // Find the new position for the fractal
      const jRX = this.juliaShiftX * this.canvasZoom - this.juliaShiftX;
      const jRY = this.juliaShiftY * this.canvasZoom - this.juliaShiftY;
      this.juliaPin.move(
        this.juliaPin.x + jRX + this.deltaX * this.canvasZoom,
        this.juliaPin.y + jRY + this.deltaY * this.canvasZoom,
      );
      this.renderer.centreCoords[0] += -1 * this.deltaX * this.renderer.pixelSize;
      this.renderer.centreCoords[1] += -1 * this.deltaY * this.renderer.pixelSize;
      if (this.type === FractalType.MANDELBROT) {
        p.store.set({
          mandelbrotCentre: this.renderer.centreCoords,
        });
      } else if (this.type === FractalType.JULIA) {
        p.store.set({
          juliaCentre: this.renderer.centreCoords,
        });
      }
      let xRect;
      let yRect;
      // Find the areas to re-render
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
      if (this.dirty) {
        // zoom on the point
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
        await this.renderRange(xRect, yRect, roundID);
      }
      this.dragging = false;
      this.deltaX = 0;
      this.deltaY = 0;
      p.store.setStat({
        renderTime: (Date.now() - startTime),
      });
    }
  }

  handleTouchStart(e) {
    const touches = e.changedTouches;
    const p = this.props;
    p.store.set({
      focus: this.type,
    });
    if (touches.length > 0) {
      this.dragging = true;
    }
    for (let i = 0; i < touches.length; i += 1) {
      this.addTouch(touches[i]);
    }
    if (Object.keys(this.activeTouches).length === 1) {
      this.getMouseViewerPosition(touches[0].pageX, touches[0].pageY);
    }
    this.handleMouseDown();
  }

  touchPan(touches) {
    if (this.dragging) {
      const [fractalX, fractalY] = this.getFractalPosition(touches[0].pageX, touches[0].pageY);
      if (this.draggingPin) {
        this.juliaPin.move(fractalX, fractalY);
        const worldJulia = this.coordsToWorld(this.juliaPin.x, this.juliaPin.y);
        const p = this.props;
        p.store.set({
          juliaPoint: worldJulia,
          movingJuliaPin: true,
        });
        requestAnimationFrame(() => this.safeUpdate());
      } else {
        const startTouch = this.activeTouches[touches[0].identifier];
        this.deltaX = Math.floor(fractalX - startTouch.fractalX);
        this.deltaY = Math.floor(fractalY - startTouch.fractalY);
        this.mouseX = fractalX;
        this.mouseY = fractalY;
        const coords = this.mouseToWorld();
        const p = this.props;
        p.store.setStat({
          re: coords[0].toFixed(5),
          im: coords[1].toFixed(5),
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
    // get the rate of change between the two fingers
    const currentLength = distance(touch1, touch2);
    if (this.previousLength) {
      this.centerPoint = centre(touch1, touch2);
      this.mouseX = this.centerPoint.x;
      this.mouseY = this.centerPoint.y;
      if (this.previousLength === -1) {
        this.previousLength = currentLength;
      }
      const magnification = Math.abs((currentLength - this.previousLength) * 0.01);
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
      const p = this.props;
      if (this.type === FractalType.MANDELBROT) {
        p.store.set({
          mandelbrotZoom: this.renderer.pixelSize,
        });
      } else if (this.type === FractalType.JULIA) {
        p.store.set({
          juliaZoom: this.renderer.pixelSize,
        });
      }
      this.prevStepZoom = 1;
      this.previousLength = -1;
      this.originX = 0;
      this.originY = 0;
      this.zoomPointX = null;
      this.zoomPointY = null;
      this.canvasZoom = 1;
      this.dirty = false;
    }
  }


  zoom(direction, magnificationStep, centred) {
    if (this.rendering) {
      return;
    }
    if (!this.zoomPointX) {
      this.zoomPointX = this.mouseX;
      this.zoomPointY = this.mouseY;
    }
    this.zooming = true;
    const magnificationDelta = magnificationStep;
    const deltaZoom = magnificationDelta * -1 * Math.sign(direction);
    let newCanvasZoom = this.canvasZoom + deltaZoom;
    if (newCanvasZoom < 0.1) {
      newCanvasZoom = 0.1;
    }
    if (this.renderer.maximumPixelSize < this.renderer.pixelSize / newCanvasZoom) {
      return;
    }
    const newZoomLevel = (this.renderer.basePixelSize / (this.renderer.pixelSize / newCanvasZoom));
    if (newZoomLevel >= 100000000) {
      // cap zoom level
      this.zoomLevel = 100000000;
      this.zooming = false;
      return;
    }
    this.zoomLevel = newZoomLevel;
    const p = this.props;
    p.store.setStat({
      zoomLevel: round(this.zoomLevel, 2),
    });

    this.mouseX = (this.zoomPointX && !centred) ? this.zoomPointX : this.width / 2;
    this.mouseY = (this.zoomPointY && !centred) ? this.zoomPointY : this.height / 2;

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
      this.zooming = false;
      this.resetZoomAndRender();
    }, 300);
    this.canvasZoom = newCanvasZoom;
    this.juliaShiftX = this.juliaPin.x - this.callBackMouse[0];
    this.juliaShiftY = this.juliaPin.y - this.callBackMouse[1];
    // The fractal has changed so if we drag we will cannot use the
    // cached one. We mark this using the dirty flag
    this.dirty = true;
    requestAnimationFrame(() => this.safeUpdate());
  }

  handleScroll(e) {
    this.zoom(e.deltaY, Math.abs(e.deltaY) / 100);
  }

  /**
   * Only render the areas in the xRect and yRect using the offset
   * @param {*} xRect
   * @param {*} yRect
   * @param {*} roundID
   */
  async renderRange(xRect, yRect, roundID) {
    this.rendering = true;
    clearTimeout(this.spinnerTimeout);
    this.spinnerTimeout = setTimeout(() => {
      this.setState({
        showSpinner: true,
      });
    }, 300);
    const result = await this.renderer.renderRange(
      xRect,
      yRect,
      this.deltaX,
      this.deltaY,
    );
    clearTimeout(this.spinnerTimeout);
    const st = this.state;
    if (st.showSpinner) {
      this.setState({
        showSpinner: false,
      });
    }
    if (result === []) {
      // if it return nothing, try render the whole fractal
      this.drawFractal();
    }
    if (this.renderID === roundID) {
      this.putImage(result.arr, result.width, result.height);
    }
    this.rendering = false;
  }

  render() {
    const p = this.props;
    const st = this.state;
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
    let classes = (p.detatched) ? 'mandelbrot-viewer-container detatched draggable-exterior' : 'mandelbrot-viewer-container attached';
    classes = (p.hidden) ? 'hide-viewer' : classes;
    const handle = (p.detatched) ? (<img draggable="false" alt="handle" className="drag-icon" src={Dragger} />) : '';
    const viewer = (
      <div
        className={classes}
      >
        {handle}
        <div
          ref={this.container}
        >
          <canvas
            onTouchStart={(e) => this.handleTouchStart(e)}
            onTouchMove={(e) => this.handleTouchMove(e)}
            onTouchEnd={(e) => this.handleTouchEnd(e)}
            onMouseDown={(e) => this.handleMouseDown(e)}
            onMouseEnter={() => {
              p.store.set({ focus: this.type });
            }}
            onDoubleClick={() => this.easeInOutZoom()}
            onMouseMove={(e) => this.handleMouseMove(e)}
            onMouseUp={(e) => this.handleMouseUp(e)}
            onMouseLeave={(e) => this.handleMouseUp(e)}
            onWheel={(e) => this.handleScroll(e)}
            id={`fractal-${this.type}`}
            ref={this.fractal}
          />
          <LoaderPopUp show={st.showSpinner} />
          {focus}
        </div>
      </div>
    );
    if (p.detatched) {
      return (
        <Draggable
          onStart={() => ((!this.dragging))}
        >
          {viewer}
        </Draggable>
      );
    }
    return viewer;
  }
}
FractalViewer.propTypes = {
  /** Type of fractal to use, maps to FractalType */
  type: PropTypes.number.isRequired,
  /** The X,Y point for the julia set's C value */
  // eslint-disable-next-line react/forbid-prop-types
  juliaPoint: PropTypes.array,
  /** Flag whether the julia pin is being moved */
  movingJuliaPin: PropTypes.bool,
  /** Global state store */
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
  /** Is the viewer in detatched mode */
  detatched: PropTypes.bool,
  /** Is the viewer hidden */
  hidden: PropTypes.bool,
  /** What render method we are using, defined by RenderMode */
  renderMode: PropTypes.number,
  overrideIterations: PropTypes.bool,
  /** Flag to display focus icon */
  focusHighlight: PropTypes.bool,
  /** Which fractal is the user focused on currently */
  focus: PropTypes.number,
  /** Maximum iterations to default to */
  maxIter: PropTypes.number,
  /** Defined from ColorMode */
  coloringMode: PropTypes.number,
  /** Overrided iteration count */
  customIterations: PropTypes.number,
  /** Which view configuration to use */
  viewMode: PropTypes.number,
  /** Used to trigger an update to the fractal */
  forceUpdate: PropTypes.number,
  /** Used to reset the zoom */
  resetFractal: PropTypes.bool,
  showRenderTrace: PropTypes.bool,
  /** Used to trigger the Julia Pin being centered */
  centreJulia: PropTypes.bool,
  /** used when updatinf both fractals (this should be done using events) */
  dualUpdateFlag: PropTypes.bool,
  /** The zoom level for the mandelbrot fractal */
  mandelbrotZoom: PropTypes.number,
  /** The zoom level for the julia fractal */
  juliaZoom: PropTypes.number,
  /** The centre point for the mandelbrot fractal */
  mandelbrotCentre: PropTypes.array,
  /** The centre point for the julia fracatl */
  juliaCentre: PropTypes.array,
  showJuliaPin: PropTypes.bool,
};

FractalViewer.defaultProps = {
  showJuliaPin: true,
  mandelbrotZoom: 0.01,
  juliaZoom: 0.03,
  mandelbrotCentre: [0, 0],
  juliaCentre: [0, 0],
  juliaPoint: [0, 0],
  movingJuliaPin: false,
  store: {},
  detatched: false,
  hidden: false,
  renderMode: Mode.JAVASCRIPT,
  overrideIterations: false,
  focusHighlight: false,
  focus: FractalType.MANDELBROT,
  maxIter: 200,
  coloringMode: ColorMode.RAINBOW,
  customIterations: -1,
  viewMode: ViewOptions.JULIA_DETATCHED,
  forceUpdate: -1,
  resetFractal: false,
  showRenderTrace: false,
  centreJulia: false,
  dualUpdateFlag: false,

};
export default withStore(FractalViewer);
