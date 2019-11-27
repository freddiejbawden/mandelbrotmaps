import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Settings.css';
import DelayedInput from '../DelayedInput';
import RenderMode from '../../utils/RenderMode';
import Timer from '../Timer';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.iterationUpdateTimer = undefined;
    this.iterations = 200;
    this.updateX = this.updateX.bind(this);
    this.updateY = this.updateY.bind(this);
    this.state = {
      collapsed: false,
    };
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

  toggle() {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const s = this.state;
    this.setState({
      collapsed: !s.collapsed,
    }, () => {
    });
  }

  resetFractal() {
    const p = this.props;
    p.updateCentreCoords(-1, 0);
    p.updatePixelSize(0.003);
  }

  render() {
    const p = this.props;
    const s = this.state;
    const contentsClasses = (s.collapsed) ? 'settings-boxes settings-collapsed' : 'settings-boxes';
    const arrowClasses = (s.collapsed) ? 'settings-min-max settings-min-max-collapse' : 'settings-min-max';
    return (
      <div className="settings-container">
        <div aria-label="Toggle Menu" tabIndex={0} role="button" onKeyDown={() => this.toggle()} onClick={() => this.toggle()} className={arrowClasses} />
        <div className={contentsClasses}>
          <Timer time={p.time} ref={p.timer} />
          <div className="options-container ">
            <strong>Settings</strong>
            <DelayedInput label="Iteration Count" type="number" defaultValue={200} callback={p.updateIter} timeout={1000} />
            <DelayedInput label="Pixel Size" type="number" defaultValue={0.003} callback={p.updatePixelSize} timeout={500} />
            <DelayedInput label="Centre X" type="number" defaultValue={-1} callback={this.updateX} timeout={500} />
            <DelayedInput label="Centre Y" type="number" defaultValue={0} callback={this.updateY} timeout={500} />
            <div>
              <div>Render Method</div>
              <select
                defaultValue={p.selectedRenderMode}
                onChange={(event) => this.updateRenderMethod(event.target.value)}
              >
                <option value={RenderMode.JAVASCRIPT}>Javascript</option>
                <option value={RenderMode.WASM}>WASM + Rust (Single Thread)</option>
                <option value={RenderMode.JAVASCRIPTMT}>Javascript (Web Worker)</option>
                <option value={RenderMode.RUSTMT}>WASM + Rust (Web Worker)</option>
              </select>
            </div>
            <div>
              <span>Enable Centre Marker </span>
              <input type="checkbox" name="centremarker" value="true" onChange={() => p.updateCentreMarker()} />
            </div>
            <button type="button" onClick={() => this.resetFractal()}>Reset Fractal</button>
          </div>
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
  time: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  timer: PropTypes.object.isRequired,
  updateCentreMarker: PropTypes.func.isRequired,
};
Settings.defaultProps = {
  selectedRenderMode: '0',
  time: '0',
};
