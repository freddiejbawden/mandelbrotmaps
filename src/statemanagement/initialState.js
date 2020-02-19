import Mode from '../Renderer/RenderMode';
import ColorMode from '../Renderer/ColorOptions';
import ViewOptions from '../utils/ViewOptions';
import FractalType from '../utils/FractalType';

const initialState = {
  renderMode: Mode.JAVASCRIPT,
  overrideIterations: false,
  customIterations: 200,
  juliaPoint: [0, 0],
  centreJulia: false,
  mandelDragging: false,
  showDebugBar: false,
  resetFractal: false,
  dualUpdateFlag: false,
  forceUpdate: 100,
  focusHighlight: false,
  focus: FractalType.MANDELBROT,
  controls: false,
  coloringMode: ColorMode.RAINBOW,
  viewMode: ViewOptions.JULIA_DETATCHED,
  showJuliaPin: true,
  stats: {
    renderTime: {
      label: 'Render Time',
      value: 0,
      unit: 'ms',
    },
    renderMode: {
      label: 'Render Mode',
      value: 0,
      unit: '',
    },
    zoomLevel: {
      label: 'Zoom Level',
      value: 1,
      unit: 'x',
    },
    iterations: {
      label: 'Iterations',
      value: 200,
      unit: '',
    },
    re: {
      label: 'Re',
      value: 0,
      unit: '',
    },
    im: {
      label: 'Im',
      value: 0,
      unit: '',
    },
    focus: {
      label: 'Focus',
      value: 0,
      unit: '',
    },
  },
};

export default initialState;
