/* eslint no-restricted-globals:0 */
addEventListener('message', event => {
  postMessage(event.data);
});