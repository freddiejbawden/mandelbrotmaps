import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Settings.css';
import DelayedInput from '../DelayedInput';
import RenderMode from '../../utils/RenderMode';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.iterationUpdateTimer = undefined;
    this.iterations = 200;
    this.updateX = this.updateX.bind(this);
    this.updateY = this.updateY.bind(this);
  }

  updateIterations(i) {
    this.iterations = i;
    if (this.iterationUpdateTimer) clearTimeout(this.iterationUpdateTimer);
    const p = this.props;
    this.iterationUpdateTimer = setTimeout(() => {
      p.updateIter(i);
    }, 1000);
  }

  updateRenderMethod(val) {
    const p = this.props;
    p.updateRenderMethod(val);
  }

  updateX(val) {
    const p = this.props;
    p.updateCentreCoords(val, undefined);
  }

  updateY(val) {
    const p = this.props;
    p.updateCentreCoords(undefined, val);
  }

  render() {
    const p = this.props;
    return (
      <div className="settings-container ">
        <strong>Settings</strong>
        <DelayedInput label="Iteration Count" type="number" defaultValue={200} callback={p.updateIter} timeout={1000} />
        <DelayedInput label="Pixel Size" type="number" defaultValue={0.003} callback={p.updatePixelSize} timeout={500} />
        <DelayedInput label="Centre X" type="number" defaultValue={-1} callback={this.updateX} timeout={500} />
        <DelayedInput label="Centre Y" type="number" defaultValue={0} callback={this.updateY} timeout={500} />
        <div>
          <div>Render Method</div>
          <select defaultValue={p.selectedRenderMode} onChange={(event) => this.updateRenderMethod(event.target.value)}>
            <option value={RenderMode.JAVASCRIPT}>Javascript</option>
            <option value={RenderMode.WASM}>WASM + Rust (Single Thread)</option>
            <option value={RenderMode.JAVASCRIPTMT}>Javascript (Web Worker)</option>
            <option value={RenderMode.RUSTMT}>WASM + Rust (Web Worker)</option>

          </select>
        </div>

      </div>
    );
  }
}
Settings.propTypes = {
  updateIter: PropTypes.func.isRequired,
  updateRenderMethod: PropTypes.func.isRequired,
  updateCentreCoords: PropTypes.func.isRequired,
  updatePixelSize: PropTypes.func.isRequired,
  selectedRenderMode: PropTypes.string,
};
Settings.defaultProps = {
  selectedRenderMode: '0',
};
