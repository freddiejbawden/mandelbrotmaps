import MandelbrotRenderer from './JavascriptRenderer';
import WASMRenderer from './WASMRenderer';
import Rectangle from '../../utils/Rectangle';

/* eslint no-restricted-globals:0 */
const renderJS = (e) => {
  const arr = new Uint8ClampedArray(e.data.arrSize);
  const mr = new MandelbrotRenderer(
    e.data.pixelSize,
    e.data.width,
    e.data.height,
    e.data.centreCoords,
    e.data.maxIter,
  );
  const colorScale = 255.0 / e.data.maxIter;
  mr.calculateFractalLimit();
  for (let i = 0; i <= e.data.endPixel * 4 - e.data.startPixel * 4; i += 4) {
    const iter = mr.escapeAlgorithm((i / 4) + e.data.startPixel) * colorScale;
    arr[i] = iter;
    arr[i + 1] = iter;
    arr[i + 2] = iter;
    arr[i + 3] = 255;
  }
  postMessage({
    arr,
    offset: e.data.startPixel * 4,
    id: e.data.id,
  });
};

const renderWasm = async (e) => {
  const wasmRenderer = new WASMRenderer(
    e.data.pixelSize,
    e.data.width,
    e.data.height,
    e.data.centreCoords,
    e.data.max_i,
  );
  wasmRenderer.renderFromTo(
    e.data.startPixel,
    e.data.endPixel,
    e.data.pixelSize,
    e.data.width,
    e.data.height,
    e.data.centreCoords,
    e.data.max_i,
  ).then((arr) => {
    postMessage({
      arr,
      offset: e.data.startPixel * 4,
      id: e.data.id,
    });
  });
};

const renderJSRange = (e) => {
  try {
    const oldArr = e.data.oldArr;
    const sT = Date.now();
    const arr = new Uint8ClampedArray(e.data.arrSize);
    const mr = new MandelbrotRenderer(
      e.data.pixelSize,
      e.data.width,
      e.data.height,
      e.data.centreCoords,
      e.data.max_i,
    );
    mr.calculateFractalLimit();
    const colorScale = 255.0 / e.data.maxIter;
    for (let i = 0; i <= e.data.endPixel * 4 - e.data.startPixel * 4; i += 4) {
      const coords = mr.calculatePosition((i / 4) + e.data.startPixel);
      const xRect = new Rectangle(e.data.xRect.l, e.data.xRect.t, e.data.xRect.w, e.data.xRect.h);
      const yRect = new Rectangle(e.data.yRect.l, e.data.yRect.t, e.data.yRect.w, e.data.yRect.h);

      if (
        (xRect.pointInBounds(coords[0], coords[1]))
          || (yRect.pointInBounds(coords[0], coords[1]))) {
        const iter = mr.escapeAlgorithm((i / 4) + e.data.startPixel) * colorScale;
        arr[i] = iter; // R value
        arr[i + 1] = iter; // G value
        arr[i + 2] = iter; // B value
        arr[i + 3] = 255; // A value
      } else {
        // copy
        const oldArrPos = (((coords[1] - e.data.dY) * e.data.width) + (coords[0] - e.data.dX)) * 4;
        arr[i] = oldArr[oldArrPos]; // R value
        arr[i + 1] = oldArr[oldArrPos + 1]; // G value
        arr[i + 2] = oldArr[oldArrPos + 2]; // B value
        arr[i + 3] = 255; // A value
      }
    }
    console.log(Date.now() - sT);
    postMessage({
      arr,
      offset: e.data.startPixel * 4,
      id: e.data.id,
    });
  } catch (err) {
    // TODO: feedback error
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

addEventListener('message', async (e) => {
  if (e.data.type === 'partial') {
    renderJSRange(e);
  } else if (e.data.renderer === 'js') {
    renderJS(e);
  } else {
    renderWasm(e);
  }
});
