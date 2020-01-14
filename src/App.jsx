import React, { Component } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { disableBodyScroll } from 'body-scroll-lock';
import FractalViewer from './components/FractalViewer';
import Settings from './components/Settings';
import Mode from './utils/RenderMode';
import DebugBar from './components/DebugBar';
import FractalType from './utils/FractalType';

const AppRouter = () => {
  disableBodyScroll(document.querySelector('#app'));
  return (
    <Router>
      <Switch>
        <Route path="/:renderMode?/:iterations?">
          <App id="app" />
        </Route>
      </Switch>
    </Router>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: '200',
      maxi: props.maxi || 200,
      renderMode: props.renderMode,
      showDebugBar: false,
      mandelDragging: false,
      stats: {
        renderTime: {
          label: 'Render Time',
          value: (`${200}ms`),
        },
        iterations: {
          label: 'Iterations',
          value: props.maxi,
        },
        zoomLevel: {
          label: 'Zoom',
          value: '1x',
        },
        re: {
          label: 'Re',
          value: -1,
        },
        im: {
          label: 'Im',
          value: 0,
        },
        focus: {
          label: 'Focus',
          value: 'mandelbrot',
        },
      },
    };
    this.appRef = React.createRef();
    this.updateMaxIterations = this.updateMaxIterations.bind(this);
    this.updateCentreMarker = this.updateCentreMarker.bind(this);
    this.updateRenderMethod = this.updateRenderMethod.bind(this);
    this.updateRenderTime = this.updateRenderTime.bind(this);
    this.updateZoomLevel = this.updateZoomLevel.bind(this);
    this.updateCoords = this.updateCoords.bind(this);
    this.updateFocus = this.updateFocus.bind(this);
    this.updateDebugBar = this.updateDebugBar.bind(this);
    this.updateJuliaPoint = this.updateJuliaPoint.bind(this);
  }

  updateCoords(re, im) {
    this.setState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        re: {
          ...prevState.stats.re,
          value: re,
        },
        im: {
          ...prevState.stats.im,
          value: im,
        },
      },
    }));
  }

  updateRenderTime(time) {
    this.setState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        renderTime: {
          ...prevState.stats.renderTime,
          value: `${time}ms`,
        },
      },
    }));
  }

  updateFocus(focus) {
    this.setState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        focus: {
          ...prevState.stats.focus,
          value: focus,
        },
      },
    }));
  }

  updateZoomLevel(zoom) {
    this.setState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        zoomLevel: {
          ...prevState.stats.zoomLevel,
          value: `${zoom}x`,
        },
      },
    }));
  }

  updateRenderMethod(newRenderMode) {
    this.setState({
      renderMode: newRenderMode,
    });
  }

  updateMaxIterations(iter) {
    this.setState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        iterations: {
          ...prevState.stats.iterations,
          value: `${iter}`,
        },
      },
    }));
  }

  updateDebugBar() {
    this.setState((prevState) => ({ showDebugBar: !prevState.showDebugBar }));
  }

  updateCentreMarker() {
    const s = this.state;
    const oldVal = s.showCentreMarker;
    this.setState({
      showCentreMarker: !oldVal,
    });
  }

  updateJuliaPoint(juliaPoint, mandelDragging) {
    this.setState(() => ({ juliaPoint, mandelDragging }));
  }

  render() {
    const s = this.state;
    // Fall back to JS
    const renderMode = parseInt(s.renderMode || 1, 10);
    const iterations = parseInt(s.stats.iterations.value || 200, 10);
    return (
      <div className="App">
        <div className="render-container">
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.MANDELBROT}
            position={0}
            maxi={iterations}
            renderMode={renderMode}
            showCentreMarker={s.showCentreMarker}
            appRef={this.appRef}
            updateRenderTime={this.updateRenderTime}
            updateZoomLevel={this.updateZoomLevel}
            updateCoords={this.updateCoords}
            updateFocus={this.updateFocus}
            updateJuliaPoint={this.updateJuliaPoint}
            onMouseOver={() => this.updateFocus('Julia')}
            onFocus={() => this.updateFocus('Julia')}
          />
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.JULIA}
            position={1}
            maxi={iterations}
            renderMode={renderMode}
            showCentreMarker={s.showCentreMarker}
            appRef={this.appRef}
            updateRenderTime={this.updateRenderTime}
            updateZoomLevel={this.updateZoomLevel}
            updateCoords={this.updateCoords}
            updateFocus={this.updateFocus}
            onMouseOver={() => this.updateFocus('Mandelbrot')}
            onFocus={() => this.updateFocus('Mandelbrot')}
            juliaPoint={s.juliaPoint}
            mandelDragging={s.mandelDragging}
          />
        </div>
        <div className="info-panel">
          <Settings
            updateIter={this.updateMaxIterations}
            selectedRenderMode={s.renderMode}
            maxi={s.maxi}
            updateCentreMarker={this.updateCentreMarker}
            updateRenderMethod={this.updateRenderMethod}
            updateDebugBar={this.updateDebugBar}
            ref={this.appRef}
          />
        </div>
        <DebugBar
          stats={s.stats}
          showDebugBar={s.showDebugBar}
        />
      </div>
    );
  }
}
App.propTypes = {
  renderMode: PropTypes.number,
  maxi: PropTypes.number,
};
App.defaultProps = {
  renderMode: Mode.JAVASCRIPT,
  maxi: 200,
};

export default AppRouter;
