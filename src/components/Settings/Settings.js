import React, { Component } from 'react';
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
    this.iterationUpdateTimer = setTimeout(() => {
      this.props.updateIter(i);
    }, 1000);
  }

  updateRenderMethod(val) {
    this.props.updateRenderMethod(val);
  }

  updateX(val) {
    this.props.updateCentreCoords(val, undefined);
  }

  updateY(val) {
    this.props.updateCentreCoords(undefined, val);
  }

  render() {
    return (
      <div className="settings-container ">
        <strong>Settings</strong>
        <DelayedInput label="Iteration Count" type="number" defaultValue={200} callback={this.props.updateIter} timeout={1000} />
        <DelayedInput label="Pixel Size" type="number" defaultValue={0.003} callback={this.props.updatePixelSize} timeout={500} />
        <DelayedInput label="Centre X" type="number" defaultValue={-1} callback={this.updateX} timeout={500} />
        <DelayedInput label="Centre Y" type="number" defaultValue={0} callback={this.updateY} timeout={500} />
        <div>
          <label>Render Method</label>
          <select defaultValue={this.props.selectedRenderMode} onChange={(event) => this.updateRenderMethod(event.target.value)}>
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
