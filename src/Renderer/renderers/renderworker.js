import MandelbrotRenderer from './JavascriptRenderer';
import WASMRenderer from './WASMRenderer';

/* eslint no-restricted-globals:0 */
const renderJS = (e) => {
  const arr = new Uint8ClampedArray(e.data.arrSize);
  const mr = new MandelbrotRenderer(
    e.data.pixelSize,
    e.data.width,
    e.data.height,
    e.data.centreCoords,
    e.data.max_i,
  );
  mr.calculateFractalLimit();
  for (let i = 0; i <= e.data.endPixel * 4 - e.data.startPixel * 4; i += 4) {
    const iter = mr.escapeAlgorithm((i / 4) + e.data.startPixel);
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
addEventListener('message', async (e) => {
  if (e.data.renderer === 'js') {
    renderJS(e);
  } else {
    renderWasm(e);
  }
});
