import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import FractalViewer from './components/FractalViewer';
import DebugBar from './components/DebugBar';
import FractalType from './utils/FractalType';
import { withStore } from './statemanagement/createStore';
import UnsupportedBrowser from './components/UnsupportedBrowser';
import { checkSupported } from './utils/checkSupported';
import preventZoom from './utils/preventZoom';
import SideBar from './components/SideBar';

class App extends Component {
  constructor(props) {
    super(props);
    this.appRef = React.createRef();
  }

  render() {
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
        <SideBar />
        <DebugBar
          showDebugBar={p.store.showDebugBar}
        />
        {unsupportedPopUp}
      </div>
    );
  }
}
App.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};
App.defaultProps = {
  store: {},
};

export default withStore(preventZoom(App));
