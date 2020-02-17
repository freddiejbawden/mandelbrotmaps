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
import setUpFocusHandler from './focusHandler/focusHandler';
import ControlsWindow from './components/ControlsWindow/ControlsWindow';
import ViewOptions from './utils/ViewOptions';

class App extends Component {
  constructor(props) {
    super(props);
    this.appRef = React.createRef();
  }

  componentDidMount() {
    const p = this.props;
    setUpFocusHandler(p.store);
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
            numberOfFractals={2}
            appRef={this.appRef}
            detatched={p.store.viewMode === ViewOptions.MANDELBROT_DETATCHED}
            hidden={p.store.viewMode === ViewOptions.JULIA_FULLSCREEN}

          />
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.JULIA}
            position={1}
            appRef={this.appRef}
            detatched={p.store.viewMode === ViewOptions.JULIA_DETATCHED}
            hidden={p.store.viewMode === ViewOptions.MANDELBROT_FULLSCREEN}


          />

        </div>
        <SideBar />
        <DebugBar
          showDebugBar={p.store.showDebugBar}
        />
        <ControlsWindow />
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
