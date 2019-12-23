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
import NerdBar from './components/NerdBar';

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
      },
    };
    this.appRef = React.createRef();
    this.updateMaxIterations = this.updateMaxIterations.bind(this);
    this.updateCentreMarker = this.updateCentreMarker.bind(this);
    this.updateRenderMethod = this.updateRenderMethod.bind(this);
    this.updateRenderTime = this.updateRenderTime.bind(this);
    this.updateZoomLevel = this.updateZoomLevel.bind(this);
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

  updateCentreMarker() {
    const s = this.state;
    const oldVal = s.showCentreMarker;
    this.setState({
      showCentreMarker: !oldVal,
    });
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
            type="julia"
            position={0}
            maxi={iterations}
            renderMode={renderMode}
            showCentreMarker={s.showCentreMarker}
            appRef={this.appRef}
            updateRenderTime={this.updateRenderTime}
            updateZoomLevel={this.updateZoomLevel}

          />
          <FractalViewer
            id="fractal-viewer"
            type="mandelbrot"
            position={1}
            maxi={iterations}
            renderMode={renderMode}
            showCentreMarker={s.showCentreMarker}
            appRef={this.appRef}
            updateRenderTime={this.updateRenderTime}
            updateZoomLevel={this.updateZoomLevel}
          />
        </div>
        <div className="info-panel">
          <Settings
            time={s.time}
            updateIter={this.updateMaxIterations}
            selectedRenderMode={s.renderMode}
            maxi={s.maxi}
            updateCentreMarker={this.updateCentreMarker}
            updateRenderMethod={this.updateRenderMethod}
            ref={this.appRef}
          />
        </div>
        <NerdBar
          stats={s.stats}
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
