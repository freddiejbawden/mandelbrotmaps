import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import Settings from '../Settings/Settings';
import './SideBar.css';
import { withStore } from '../../statemanagement/createStore';
import FractalType from '../../utils/FractalType';

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

  render() {
    let devTools = '';
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
        {devTools}
      </div>
    );
  }
}
SideBar.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object.isRequired,
};
export default withStore(SideBar);
