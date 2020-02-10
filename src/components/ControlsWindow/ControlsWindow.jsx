import React, { Component } from 'react';
import {
  Segment, Header, Icon, Transition,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';

import './ControlsWindow.css';
import Control from './Control/Control';
import { withStore } from '../../statemanagement/createStore';

// eslint-disable-next-line react/prefer-stateless-function
class ControlsWindow extends Component {
  handleClose() {
    const p = this.props;
    const st = p.store;
    st.toggle('controls');
  }

  render() {
    let content;
    const p = this.props;
    const s = p.store;
    if (s.controls) {
      content = (
        <Segment
          className="controls-window"
          style={{
            position: 'fixed',
          }}
        >
          <div className="controls-top">
            <Header>Controls</Header>
            <Icon name="close" className="controls-close" onClick={(e) => this.handleClose(e)} />
          </div>
          <div className="details-container">
            <div>
              <Header as="h4">Keyboard</Header>
              <div className="controls-container">
                <Control keys={['arrow left', 'arrow right', 'arrow up', 'arrow down']} description="Pan Fractal" />
                <Control keys={['Shift', 'Arrow']} description="Move Julia Pin" join />
                <Control keys={['+', '-']} description="Zoom" />
                <Control keys={['1']} description="Change focus to Mandelbrot" />
                <Control keys={['2']} description="Change focus to Julia" />
                <Control keys={['C']} description="Centre Julia Pin" />
                <Control keys={['R']} description="Reset Fractals" />
                <Control keys={['S']} description="Open Settings Menu" />
                <Control keys={['H']} description="Open Help Menu" />
              </div>
            </div>
            <div className="divider" />
            <div>
              <Header as="h4">Mouse</Header>
              <div className="controls-container">
                <Control type="text" text="Click + Drag" description={'Pan Fractal /\n Move Julia Pin'} />
                <Control type="text" text="Scroll / Pinch" description="Zoom Fractal" />
              </div>
              <Header as="h4">Touch</Header>
              <div className="controls-container">
                <Control type="text" text="Touch + Drag" description="Pan Fractal" />
                <Control type="text" text="Pinch / Double Tap" description="Zoom Fractal" />
              </div>
            </div>
          </div>
        </Segment>
      );
    }
    return (
      <Transition.Group animation="fly right" duration={500}>
        {content}
      </Transition.Group>
    );
  }
}

ControlsWindow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};

ControlsWindow.defaultProps = {
  store: {},
};

export default withStore(ControlsWindow);
