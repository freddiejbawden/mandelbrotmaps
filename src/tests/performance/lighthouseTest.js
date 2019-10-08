const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      // use results.lhr for the JS-consumeable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      return chrome.kill().then(() => results.lhr)
    });
  });
}
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-meaningful-paint',
      'speed-index',
      'first-cpu-idle',
      'interactive',
    ],
  },
}
const opts = {
  onlyCategories: ['performance'],
  chromeFlags: ['--headless']
};

// Usage:
launchChromeAndRunLighthouse('http://localhost:3000', opts,config).then(results => {
  // Use results!
  results.audits['user-timings'].details.items.forEach(elem => {
    if (elem.name === "fractal_render_time") {
      console.log(elem.startTime);
    }
  })
}).catch(e => {
  console.log(`An error occured ${e}`);
})