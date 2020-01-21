import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import FractalViewer from './components/FractalViewer';
import Settings from './components/Settings';
import Mode from './utils/RenderMode';
import DebugBar from './components/DebugBar';
import FractalType from './utils/FractalType';
import { withStore } from './statemanagement/createStore';

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
        iterations: {
          label: 'Iterations',
          value: props.maxi,
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
    this.updateCentreMarker = this.updateCentreMarker.bind(this);
    this.updateCoords = this.updateCoords.bind(this);
    this.updateFocus = this.updateFocus.bind(this);
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

  updateRenderMethod(newRenderMode) {
    this.setState({
      renderMode: newRenderMode,
    });
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
    const p = this.props;
    // Fall back to JS
    return (
      <div className="App">
        <div className="render-container">
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.MANDELBROT}
            position={0}
            showCentreMarker={s.showCentreMarker}
            appRef={this.appRef}
            updateCoords={this.updateCoords}
            updateFocus={this.updateFocus}
            onMouseOver={() => this.updateFocus('Julia')}
            onFocus={() => this.updateFocus('Julia')}
          />
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.JULIA}
            position={1}
            showCentreMarker={s.showCentreMarker}
            appRef={this.appRef}
            updateCoords={this.updateCoords}
            updateFocus={this.updateFocus}
            onMouseOver={() => this.updateFocus('Mandelbrot')}
            onFocus={() => this.updateFocus('Mandelbrot')}
          />
        </div>
        <div className="info-panel">
          <Settings
            selectedRenderMode={s.renderMode}
            maxi={s.maxi}
            updateCentreMarker={this.updateCentreMarker}
            updateRenderMethod={this.updateRenderMethod}
            ref={this.appRef}
          />
        </div>
        <DebugBar
          stats={s.stats}
          showDebugBar={p.store.showDebugBar}
        />
      </div>
    );
  }
}
App.propTypes = {
  renderMode: PropTypes.number,
  maxi: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object.isRequired,
};
App.defaultProps = {
  renderMode: Mode.JAVASCRIPT,
  maxi: 200,
};

export default withStore(App);
