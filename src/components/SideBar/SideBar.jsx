import React, { Component } from 'react';
import { Button, Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import Settings from '../Settings/Settings';
import './SideBar.css';
import { withStore } from '../../statemanagement/createStore';
import FractalType from '../../utils/FractalType';
import ViewOptions from '../../utils/ViewOptions';
import LinkShare from '../LinkShare';


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

  changeView() {
    const p = this.props;
    let newOption;
    if (p.store.viewMode === ViewOptions.SIDEBYSIDE) {
      newOption = ViewOptions.JULIA_DETATCHED;
    } else {
      newOption = ViewOptions.SIDEBYSIDE;
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
    st.toggle('help');
  }

  render() {
    let devTools = '';
    const p = this.props;
    const s = this.state;
    const view = (p.store.viewMode === ViewOptions.SIDEBYSIDE) ? 'detatch.png' : 'sidebyside.png';
    let viewText;
    if (p.store.viewMode === ViewOptions.SIDEBYSIDE) {
      viewText = 'Change to detatched viewer';
    } else {
      viewText = 'Change to side by side viewer';
    }
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
          <Popup
            position="right center"
            content="Centre Julia Pin"
            trigger={(
              <Button
                onClick={() => this.centreJulia()}
                className="side-button"
                size="large"
                circular
                icon="crosshairs"
              />
           )}
          />
        </div>
        <div>
          <Popup
            position="right center"
            content={viewText}
            trigger={(
              <Button
                onClick={() => this.changeView()}
                className="side-button"
                size="large"
                circular
                style={{ padding: '12px', height: '42px', width: '42px' }}
              >
                <img alt="viewbutton" src={view} className="sidebyside" />
              </Button>
           )}
          />
        </div>
        <div>
          <Popup
            position="right center"
            content="Reset Zoom"
            trigger={(
              <Button
                onClick={() => this.resetZoom()}
                className="side-button"
                size="large"
                circular
                icon="undo"
              />
          )}
          />

        </div>
        <LinkShare />
        <div>
          <Popup
            position="right center"
            content="Swap Views"
            trigger={(
              <Button
                onClick={() => this.swapView()}
                className="side-button"
                size="large"
                circular
                icon="exchange"
                disabled={(p.store.viewMode === ViewOptions.SIDEBYSIDE)}
              />
          )}
          />
        </div>
        <div>
          <Popup
            position="right center"
            content="Open Help Menu"
            trigger={(
              <Button
                onClick={() => this.toggleControls()}
                className="side-button"
                size="large"
                circular
                icon="help"
              />
)}
          />

        </div>
        <div>
          <Settings />
        </div>
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
