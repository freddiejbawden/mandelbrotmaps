import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import Settings from '../Settings/Settings';
import './SideBar.css';
import { withStore } from '../../statemanagement/createStore';
import FractalType from '../../utils/FractalType';
import ViewOptions from '../../utils/ViewOptions';

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devMode: false,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 112) {
        this.setState((ps) => ({
          devMode: !ps.devMode,
        }));
      }
      if (e.keyCode === 67) {
        this.centreJulia();
      }
      if (e.keyCode === 82) {
        this.resetZoom();
      }
    });
  }

  swapView() {
    const p = this.props;
    let newOption = ViewOptions.SIDEBYSIDE;
    if (p.store.viewMode === ViewOptions.JULIA_DETATCHED) {
      newOption = ViewOptions.MANDELBROT_DETATCHED;
    } else if (p.store.viewMode === ViewOptions.MANDELBROT_DETATCHED) {
      newOption = ViewOptions.JULIA_DETATCHED;
    } else if (p.store.viewMode === ViewOptions.MANDELBROT_FULLSCREEN) {
      newOption = ViewOptions.JULIA_FULLSCREEN;
    } else if (p.store.viewMode === ViewOptions.JULIA_FULLSCREEN) {
      newOption = ViewOptions.MANDELBROT_FULLSCREEN;
    }
    p.store.set({
      viewMode: newOption,
    });
  }

  centreJulia() {
    const p = this.props;
    const st = p.store;
    st.set({
      centreJulia: true,
    });
  }

  resetZoom() {
    const p = this.props;
    const st = p.store;
    st.set({
      resetFractal: true,
    });
  }

  forceUpdate(v) {
    const p = this.props;
    const st = p.store;
    st.set({
      forceUpdate: v,
    });
  }

  toggleControls() {
    const p = this.props;
    const st = p.store;
    st.toggle('controls');
  }

  render() {
    let devTools = '';
    const p = this.props;
    const s = this.state;
    if (s.devMode) {
      devTools = (
        <div>
          <Button
            onClick={() => this.forceUpdate(FractalType.MANDELBROT)}
            className="side-button"
            size="large"
          >
            Render Mandelbrot
          </Button>
          <Button
            onClick={() => this.forceUpdate(FractalType.JULIA)}
            className="side-button"
            size="large"
          >
            Render J
          </Button>
        </div>
      );
    }

    let exchangeButton = '';
    if (p.store.viewMode !== ViewOptions.SIDEBYSIDE) {
      exchangeButton = (
        <div>
          <Button
            onClick={() => this.swapView()}
            className="side-button"
            size="large"
            circular
            icon="exchange"
          />
        </div>
      );
    }
    return (
      <div className="side-bar-container">
        <div>
          <Settings />
        </div>
        <div>
          <Button
            onClick={() => this.centreJulia()}
            className="side-button"
            size="large"
            circular
            icon="crosshairs"
          />
        </div>
        <div>
          <Button
            onClick={() => this.resetZoom()}
            className="side-button"
            size="large"
            circular
            icon="undo"
          />
        </div>
        <div>
          <Button
            onClick={() => this.toggleControls()}
            className="side-button"
            size="large"
            circular
            icon="help"
          />
        </div>
        {exchangeButton}
        {devTools}
      </div>
    );
  }
}
SideBar.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};

SideBar.defaultProps = {
  store: {},
};

export default withStore(SideBar);
