import JSRenderer from './JavascriptRenderer';
import WASMRenderer from './WASMRenderer';

/* eslint no-restricted-globals:0 */
const renderJS = (data) => {
  try {
    const arr = new Uint8ClampedArray(data.arrSize);
    const mr = new JSRenderer(
      data.pixelSize,
      data.width,
      data.height,
      data.centreCoords,
      data.maxIter,
    );
    const colorScale = 255.0 / data.maxIter;
    mr.calculateFractalLimit();
    for (let i = 0; i <= data.endPixel * 4 - data.startPixel * 4; i += 4) {
      const iter = mr.escapeAlgorithm((i / 4) + data.startPixel) * colorScale;
      arr[i] = iter;
      arr[i + 1] = iter;
      arr[i + 2] = iter;
      arr[i + 3] = 255;
    }
    postMessage({
      arr,
      offset: data.startPixel * 4,
      id: data.id,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
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

const renderJSRange = (data) => {
  try {
    const mr = new JSRenderer(
      data.pixelSize,
      data.width,
      data.height,
      data.centreCoords,
      data.max_i,
    );
    const arr = mr.renderRange(
      data.xRect,
      data.yRect,
      data.dX,
      data.dY,
      data.oldArr,
      data.startRow,
      data.endRow,
    );
    postMessage({
      success: true,
      arr,
      offset: data.startRow * data.width * 4,
      id: data.id,
    });
  } catch (err) {
    // TODO: feedback error
    // eslint-disable-next-line no-console
    console.log(`${data.workerID}: ${err}`);
    postMessage({
      success: false,
      err,
    });
  }
};

addEventListener('message', async (e) => {
  if (e.data.type === 'partial') {
    renderJSRange(e.data);
  } else if (e.data.renderer === 'js') {
    renderJS(e.data);
  } else {
    renderWasm(e.data);
  }
});
