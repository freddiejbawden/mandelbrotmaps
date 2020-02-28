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
import ViewOptions from './utils/ViewOptions';
import HelpWindow from './components/HelpWindow/HelpWindow';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';

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
    let welcomeScreen = '';
    if (!window.localStorage.getItem('firstTime')) {
      welcomeScreen = (<WelcomeModal />);
    }
    return (
      <div className="App">
        <div className="render-container">
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.MANDELBROT}
            detatched={p.store.viewMode === ViewOptions.MANDELBROT_DETATCHED}
            hidden={p.store.viewMode === ViewOptions.JULIA_FULLSCREEN}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...p.store}
          />
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.JULIA}
            detatched={p.store.viewMode === ViewOptions.JULIA_DETATCHED}
            hidden={p.store.viewMode === ViewOptions.MANDELBROT_FULLSCREEN}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...p.store}
            juliaZoom={(window.innerWidth < 600) ? 0.03 : 0.01}

          />

        </div>
        <SideBar />
        <DebugBar
          showDebugBar={p.store.showDebugBar}
        />
        <HelpWindow />
        {unsupportedPopUp}
        {welcomeScreen}
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
