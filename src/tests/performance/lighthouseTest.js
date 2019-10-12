const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const {URL} = require('url');

const testFractalTime = async (url,headless=true) => {

// Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
const browser = await puppeteer.launch({
  headless
});

// Wait for Lighthouse to open url, then customize network conditions.
// Note: this will re-establish these conditions when LH reloads the page. Think that's ok....
browser.on('targetchanged', async target => {
  const page = await target.page();
});

// Lighthouse will open URL. Puppeteer observes `targetchanged` and sets up network conditions.
// Possible race condition.
const {lhr} = await lighthouse(url, {
  port: (new URL(browser.wsEndpoint())).port,
  output: 'json',
  onlyCategories: ['performance'],
  chromeFlags: ['--headless']
});
let renderTime; 
lhr.audits['user-timings'].details.items.forEach(elem => {
  if (elem.name === "fractal_render_time") {
    renderTime = elem.startTime
  }
})
await browser.close();
return renderTime
}
(async() => {
  console.log("Starting JS Test")
  const jsRender = await testFractalTime('http://localhost:3000/javascript',false)
  console.log("JS Test Complete")
  console.log("Staring WASM Test")
  const wasmRender = await testFractalTime('http://localhost:3000/wasm')
  console.log("WASM Test Complete")

  console.log("\n=================== RESULTS ===================")
  console.log(`JS:\t${jsRender}\nWASM:\t${wasmRender}`)
})();
