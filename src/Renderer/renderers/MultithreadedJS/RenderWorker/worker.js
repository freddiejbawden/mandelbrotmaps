/* eslint no-restricted-globals:0 */


addEventListener('message', e => {
  const arr = new Uint8ClampedArray(e.data.numRows*e.data.width*4)
  for (let i = 0; i <= e.data.numRows*e.data.width*4; i+=4){
    arr[i] = e.data.id*50
    arr[i+1] = 0
    arr[i+2] = 0
    arr[i+3] = 255
  }
  postMessage({
    arr,
    id: e.data.id
  })
});