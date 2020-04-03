/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const pptrFirefox = require('puppeteer-firefox');
const devices = require('puppeteer/DeviceDescriptors');
const fs = require('fs');

const config = require('./config');


const testLoad = async (page) => {
  await page.keyboard.press('Q');
  await page.waitFor(3000);
  const perfData = JSON.parse(await page.evaluate(
    () => JSON.stringify(window.performance.getEntriesByType('measure')),
  ));
  console.log(perfData);
  if (perfData.length > 0) {
    const x = perfData.pop();
    console.log(x.duration);
    return x.duration;
  }
  return -1;
};

const testFractalTime = async (url, iterations) => {
  let controller;
  if (config.engine === 'Gecko') {
    controller = pptrFirefox;
  } else {
    controller = puppeteer;
  }
  const browser = await controller.launch({
    headless: false,
  });
  const page = await browser.newPage();
  const version = await page.browser().version();
  console.log(version);
  if (config.device && config.device !== 'None') {
    const deviceConfig = devices[config.device];
    await page.emulate(deviceConfig);
  }
  await page.goto(url).catch((err) => { throw err; });
  await page.waitFor(1000);
  const timing = [];
  for (let i = 0; i < iterations; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    timing.push(await testLoad(page));
  }
  await browser.close();
  console.log(timing);
  return timing;
  // Lighthouse will open URL. Puppeteer observes `targetchanged` and sets up network conditions.
  // Possible race condition.
};

const testZoomLevel = async (file, zoom) => {
  console.log('Starting JS Test');
  const iterations = parseInt(config.iterations, 10);
  const generateURL = (mode) => `localhost:3000/app/?renderMode=${mode}&nChunks=8&viewMode=3&mandelbrotZoom=${zoom}`;
  let url = generateURL(3);
  const jsRender = await testFractalTime(url, iterations, pptrFirefox);
  console.log('JS Test Complete');
  console.log('Staring WASM Test');
  url = generateURL(4);

  const wasmRender = await testFractalTime(url, iterations, pptrFirefox);
  console.log('WASM Test Complete');
  for (let i = 0; i < iterations; i += 1) {
    fs.appendFile(file, `${zoom},${jsRender[i]},${wasmRender[i]}\n`, (err) => {
      if (err) throw err;
      console.log('Saved ');
    });
  }
};

const loadConfig = () => {
  process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
    if (val.indexOf('=') !== -1) {
      const arg = val.split('=');
      const stripped = arg[1].replace('"', '');
      config[arg[0]] = stripped;
    }
  });
};

(async () => {
  loadConfig();
  const file = `./src/tests/performance/${config.filename}.csv`;
  fs.writeFile(file, '', (err) => {
    if (err) throw err;
    console.log('Saved!');
  });
  fs.appendFile(file, 'nChunks,JS,WASM\n', (err) => {
    if (err) throw err;
    console.log('Saved!');
  });
  for (let i = 0; i < parseInt(config.numberOfSteps, 10); i += 1) {
    console.log(`Chunk Size ${2 ** i}`);
    // eslint-disable-next-line no-await-in-loop
    await testZoomLevel(file, parseInt(config.stepsize, 10) ** i);
  }
})();
