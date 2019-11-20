import JSRenderer from './JavascriptRenderer';
import WASMRenderer from './WASMRenderer';
import Rectangle from '../../utils/Rectangle';

const wasmRenderer = new WASMRenderer(0.003, 300, 300, [0, 0], 200);
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

const renderWasmRange = async (e) => {
  let xRectReconstructed;
  let yRectReconstructed;
  console.log(`t: ${e.data.xRect.t}`);
  try {
    xRectReconstructed = new Rectangle(
      e.data.xRect.l,
      e.data.xRect.t,
      e.data.xRect.w,
      e.data.xRect.h,
    );
    yRectReconstructed = new Rectangle(
      e.data.yRect.l,
      e.data.yRect.t,
      e.data.yRect.w,
      e.data.yRect.h,
    );
  } catch (err) {
    console.log(err);
  }

  wasmRenderer.renderRange(
    xRectReconstructed,
    yRectReconstructed,
    e.data.dX,
    e.data.dY,
    e.data.oldArr,
    e.data.startRow,
    e.data.endRow,
    e.data.width,
    e.data.height,
    e.data.centreCoords[0],
    e.data.centreCoords[1],
  ).then((fractal) => {
    console.log(`${e.data.workerID} done!`);
    console.log(fractal.arr.slice(0, 8));
    postMessage({
      success: true,
      fractal,
      offset: e.data.startRow * e.data.width * 4,
      id: e.data.id,
    });
  }).catch((err) => {
    console.log(err);
    postMessage({
      success: false,
      fractal: {
        arr: [],
        width: e.data.width,
        height: e.data.height,
      },
      offset: e.data.startRow * e.data.width * 4,
      id: e.data.id,
    });
  });
};

const renderJSRange = async (data) => {
  try {
    const mr = new JSRenderer(
      data.pixelSize,
      data.width,
      data.height,
      data.centreCoords,
      data.max_i,
    );
    const fractal = await mr.renderRange(
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
      fractal,
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
    if (e.data.renderer === 'wasm') {
      renderWasmRange(e);
    } else {
      renderJSRange(e.data);
    }
  } else if (e.data.renderer === 'js') {
    renderJS(e.data);
  } else {
    renderWasm(e);
  }
});
