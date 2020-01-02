import JSRenderer from './JavascriptRenderer';
import WASMRenderer from './WASMRenderer';
import Rectangle from '../../utils/Rectangle';

const wasmRenderer = new WASMRenderer(0.003, 300, 300, [0, 0], 200, 1);
/* eslint no-restricted-globals:0 */
const renderJS = (data) => {
  try {
    const arr = new Uint8ClampedArray(data.arrSize);
    const mr = new JSRenderer(
      data.type,
      data.pixelSize,
      data.width,
      data.height,
      data.centreCoords,
      data.maxIter,
      data.juliaPoint,
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
      workerID: data.workerID,
      offset: data.startPixel * 4,
      id: data.id,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};

const renderWasm = async (e) => {
  wasmRenderer.setFractalType(e.data.type);
  wasmRenderer.renderFromTo(
    e.data.startPixel,
    e.data.endPixel,
    e.data.pixelSize,
    e.data.width,
    e.data.height,
    e.data.centreCoords,
    e.data.maxIter,
    e.data.juliaPoint,
  ).then((arr) => {
    postMessage({
      arr,
      offset: e.data.startPixel * 4,
      id: e.data.id,
    });
  });
};

const renderWasmRange = async (e) => {
  wasmRenderer.setFractalType(e.data.type);
  try {
    const xRectReconstructed = new Rectangle(
      e.data.xRect.l,
      e.data.xRect.t,
      e.data.xRect.w,
      e.data.xRect.h,
    );
    const yRectReconstructed = new Rectangle(
      e.data.yRect.l,
      e.data.yRect.t,
      e.data.yRect.w,
      e.data.yRect.h,
    );
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
      e.data.maxIter,
      e.data.centreCoords[0],
      e.data.centreCoords[1],
      e.data.juliaPoint,
    ).then((fractal) => {
      postMessage({
        success: true,
        fractal,
        offset: e.data.startRow * e.data.width * 4,
        id: e.data.id,
      });
    }).catch(() => {
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

const renderJSRange = async (data) => {
  try {
    const mr = new JSRenderer(
      data.type,
      data.pixelSize,
      data.width,
      data.height,
      data.centreCoords,
      data.maxIter,
      data.juliaPoint,
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
      workerID: data.workerID,
      fractal,
      offset: data.startRow * data.width * 4,
      id: data.id,
    });
  } catch (err) {
    // TODO: feedback error
    // eslint-disable-next-line no-console
    postMessage({
      success: false,
      err,
    });
  }
};


addEventListener('message', async (e) => {
  if (e.data.mode === 'partial') {
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
