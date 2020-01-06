import ShadingOptions from './ShadingOptions';

class RenderOptions {
  constructor(shading) {
    // eslint-disable-next-line no-unneeded-ternary
    this.shading = (shading !== undefined) ? shading : ShadingOptions.FULL;
  }
}

export default RenderOptions;
