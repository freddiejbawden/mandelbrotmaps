import parser from 'ua-parser-js';

const supportType = {
  FULL: 0, PERFORMANCE: 1, VERSION: 2, NONE: 3,
};
const SupportType = Object.freeze(supportType);

const browsers = {
  mozilla: SupportType.FULL,
  firefox: SupportType.FULL,
  chrome: SupportType.FULL,
  edge: SupportType.FULL,
  safari: SupportType.PERFORMANCE,
  opera: SupportType.PERFORMANCE,
};

const getSupportType = () => {
  const uaData = parser(navigator.userAgent);
  const supported = browsers[uaData.browser.name.toLowerCase()];
  if (supported !== undefined || supported !== null) {
    return supported;
  }
  return SupportType.NONE;
};

const checkSupported = () => (getSupportType() === SupportType.FULL);

const getSupportText = () => {
  const uaData = parser(navigator.userAgent);
  const support = getSupportType();
  const b = uaData.browser;
  const browserName = b.name;
  const ver = b.version;
  switch (support) {
    case SupportType.PERFORMANCE:
      return `${browserName} lacks features that are required for optimal performance. Without these the application may run slower than expected`;
    case SupportType.VERSION:
      return `${browserName} version ${ver} does not support all the features needed to run this application fully. Please upgrade to the latest version.`;
    case SupportType.NONE:
      return `${browserName} does not support all the features needed to run this application fully.`;
    default:
      return 'This browser has not been tested with this application! Some features may not work as expected.';
  }
};

export { checkSupported, SupportType, getSupportText };
