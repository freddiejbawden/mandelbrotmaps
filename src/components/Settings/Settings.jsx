import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Settings.css';
import DelayedInput from '../DelayedInput';
import RenderMode from '../../utils/RenderMode';
import Cog from './cog.svg';
import { withStore } from '../../statemanagement/createStore';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.iterationUpdateTimer = undefined;
    this.iterations = 200;
    this.state = {
      collapsed: true,
    };
    this.updateIterations = this.updateIterations.bind(this);
  }

  updateIterations(i) {
    if (this.iterationUpdateTimer) clearTimeout(this.iterationUpdateTimer);
    const p = this.props;
    this.iterationUpdateTimer = setTimeout(() => {
      const iter = parseInt(i, 10);
      p.store.setStat({ iterations: iter });
      p.store.set({ iterations: iter });
    }, 300);
  }

  updateRenderMethod(val) {
    const p = this.props;
    p.store.setStat({
      renderMode: parseInt(val, 10),
    });
    p.store.set({ renderMode: parseInt(val, 10) });
    // p.updateRenderMethod(parseInt(val, 10));
  }

  toggle() {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const s = this.state;
    this.setState({
      collapsed: !s.collapsed,
    }, () => {
    });
  }

  render() {
    const p = this.props;
    const s = this.state;
    const contentsClasses = (s.collapsed) ? 'settings-collapsed settings-boxes' : 'settings-boxes';
    const arrowClasses = (s.collapsed) ? 'settings-min-max settings-min-max-collapse' : 'settings-min-max';
    const blockerClass = (s.collapsed) ? 'blocker-collapse' : 'blocker';
    const blocker = (window.innerWidth < 300) ? (<div className={blockerClass} />) : '';

    return (
      <div className="settings-container">
        {blocker}
        <div aria-label="Toggle Menu" tabIndex={0} role="button" onKeyDown={() => this.toggle()} onClick={() => this.toggle()} className={arrowClasses}>
          <img src={Cog} alt="Settings Cog" />
        </div>
        <div className={contentsClasses}>
          <div className="options-container ">
            <strong>Settings</strong>
            <DelayedInput label="Iteration Count" type="number" defaultValue={200} callback={this.updateIterations} timeout={1000} />
            <div>
              <label htmlFor="renderMethod">
Render Method
                <select
                  id="renderMethod"
                  defaultValue={p.selectedRenderMode}
                  onChange={(event) => this.updateRenderMethod(event.target.value)}
                >
                  <option value={RenderMode.JAVASCRIPT}>Javascript</option>
                  <option value={RenderMode.WASM}>WASM + Rust (Single Thread)</option>
                  <option value={RenderMode.JAVASCRIPTMT}>Javascript (Web Worker)</option>
                  <option value={RenderMode.WASMMT}>WASM + Rust (Web Worker)</option>
                </select>
              </label>


            </div>
            <div>
              <label htmlFor="debugbartoggle">
Enable Debug Bar
                <input id="debugbartoggle" type="checkbox" name="debugbar" value="true" onChange={() => p.store.toggle('showDebugBar')} />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Settings.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
  selectedRenderMode: PropTypes.number,
};
Settings.defaultProps = {
  selectedRenderMode: 0,
  store: {},
};

export default withStore(Settings);
