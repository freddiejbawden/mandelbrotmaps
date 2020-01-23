import Mode from '../Renderer/RenderMode';

const initialState = {
  renderMode: Mode.JAVASCRIPT,
  overrideIterations: false,
  customIterations: undefined,
  juliaPoint: [0, 0],
  mandelDragging: false,
  showDebugBar: false,
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
