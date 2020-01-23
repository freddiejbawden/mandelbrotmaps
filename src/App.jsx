import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import FractalViewer from './components/FractalViewer';
import Settings from './components/Settings';
import Mode from './Renderer/RenderMode';
import DebugBar from './components/DebugBar';
import FractalType from './utils/FractalType';
import { withStore } from './statemanagement/createStore';
import UnsupportedBrowser from './components/UnsupportedBrowser';
import { checkSupported } from './utils/checkSupported';
import preventZoom from './utils/preventZoom';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxi: props.maxi || 200,
      renderMode: props.renderMode,
    };
    this.appRef = React.createRef();
  }

  render() {
    const s = this.state;
    const p = this.props;

    let unsupportedPopUp = '';
    if (!checkSupported()) {
      if (!window.localStorage.getItem('understandUnsupported')) {
        unsupportedPopUp = (<UnsupportedBrowser />);
      }
    }
    return (
      <div className="App">
        <div className="render-container">
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.MANDELBROT}
            position={0}
            appRef={this.appRef}
          />
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.JULIA}
            position={1}
            appRef={this.appRef}
          />
        </div>
        <div className="info-panel">
          <Settings
            selectedRenderMode={s.renderMode}
            maxi={s.maxi}
            ref={this.appRef}
          />
        </div>
        <DebugBar
          showDebugBar={p.store.showDebugBar}
        />
        {unsupportedPopUp}
      </div>
    );
  }
}
App.propTypes = {
  renderMode: PropTypes.number,
  maxi: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};
App.defaultProps = {
  renderMode: Mode.JAVASCRIPT,
  maxi: 200,
  store: {},
};

export default withStore(preventZoom(App));
