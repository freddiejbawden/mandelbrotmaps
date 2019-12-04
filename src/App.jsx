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
    };
    this.appRef = React.createRef();
    this.updateMaxIterations = this.updateMaxIterations.bind(this);
    this.updateCentreMarker = this.updateCentreMarker.bind(this);
    this.updateRenderMethod = this.updateRenderMethod.bind(this);
  }

  updateRenderMethod(newRenderMode) {
    this.setState({
      renderMode: newRenderMode,
    });
  }

  updateMaxIterations(iter) {
    this.setState({
      maxi: parseInt(iter, 10),
    });
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
    return (
      <div className="App">
        <div className="render-container">
          <FractalViewer
            id="fractal-viewer"
            type="julia"
            number={0}
            total={2}
            maxi={s.maxi}
            renderMode={renderMode}
            showCentreMarker={s.showCentreMarker}
            appRef={this.appRef}
          />
          <FractalViewer
            id="fractal-viewer"
            type="mandelbrot"
            number={1}
            total={2}
            maxi={s.maxi}
            renderMode={renderMode}
            showCentreMarker={s.showCentreMarker}
            appRef={this.appRef}
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
