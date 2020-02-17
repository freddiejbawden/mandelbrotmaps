import React, { Component } from 'react';
import {
  Segment, Modal, Header, Icon, Button,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';

import './ControlsWindow.css';
import Control from './Control/Control';
import { withStore } from '../../statemanagement/createStore';

class ControlsWindow extends Component {
  constructor(props) {
    super(props);
    this.content = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    // only redraw when controls triggered
    if (nextProps.store.controls !== this.controls) {
      this.controls = nextProps.store.controls;
      return true;
    }
    return false;
  }

  handleClose() {
    const p = this.props;
    const st = p.store;
    st.toggle('controls');
  }

  render() {
    let content;
    const p = this.props;
    const s = p.store;
    const controlsInfo = (
      <div ref={this.content}>
        <div className="controls-top">
          <Header>Controls</Header>
          <Icon name="close" className="controls-close" onClick={(e) => this.handleClose(e)} />
        </div>
        <div className="details-container">
          <div>
            <Header as="h4">Keyboard</Header>
            <div className="controls-container">
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
        <Button
          primary
          className="controls-close-button"
          onClick={() => this.handleClose()}
        >
    Close
        </Button>
      </div>
    );
    if (s.controls && (window.innerWidth < 700 || window.innerHeight < 700)) {
      content = (
        <Modal
          className="controls-modal"
          open
        >
          {controlsInfo}
        </Modal>
      );
    } else if (s.controls) {
      content = (
        <Segment
          open
          className="controls-window"
        >
          {controlsInfo}
        </Segment>
      );
    }
    return (
      <div>
        {content}
      </div>
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
