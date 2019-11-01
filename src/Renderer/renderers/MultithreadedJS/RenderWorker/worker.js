/* eslint no-restricted-globals:0 */
import MandelbrotViewer from '../../JavascriptRenderer'

addEventListener('message', e => {
  console.log(`Worker ${e.data.id} started running from ${e.data.startPixel}  ${e.data.endPixel}`)
  const arr = new Uint8ClampedArray(e.data.arrSize)
  const mr = new  MandelbrotViewer(e.data.pixelSize,e.data.width,e.data.height,e.data.centreCoords,e.data.max_i)
  mr.calculateFractalLimit()
  for (let i = 0; i <= e.data.endPixel*4-e.data.startPixel*4; i+=4) {
    const iter = mr.escapeAlgorithm((i/4)+e.data.startPixel)
    arr[i] = (e.data.id % 3 == 0) ? iter : 0
    arr[i+1] = (e.data.id % 3 == 1) ? iter : 0
    arr[i+2] = (e.data.id % 3 == 2) ? iter : 0
    arr[i+3] = 255
  }
  postMessage({
    arr,
    offset: e.data.startPixel*4,
    id: e.data.id
  })
});