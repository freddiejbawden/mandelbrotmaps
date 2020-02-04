import FractalType from '../utils/FractalType';

const setUpFocusHandler = (store) => {
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === 49) {
      store.setStat({
        focus: FractalType.MANDELBROT,
      });
    }
    if (e.keyCode === 50) {
      store.setStat({
        focus: FractalType.JULIA,
      });
    }
  });
};

export default setUpFocusHandler;
