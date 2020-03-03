import FractalType from '../utils/FractalType';

const setUpFocusHandler = (store) => {
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === 49) {
      store.set({
        focus: FractalType.MANDELBROT,
      });
    }
    if (e.keyCode === 50) {
      store.set({
        focus: FractalType.JULIA,
      });
    }
  });
};

export default setUpFocusHandler;
