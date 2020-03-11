import React, { Component } from 'react';
import {
  Segment, Modal, Header, Icon, Button,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import './HelpWindow.css';
import { withStore } from '../../statemanagement/createStore';
import Controls from './Controls/Controls';

class HelpWindow extends Component {
  constructor(props) {
    super(props);
    this.content = React.createRef();
    this.state = {
      redirect: null,
    };
  }


  redirect = (link) => {
    // some action...
    // then redirect
    this.setState({ redirect: link });
  }

  handleClose() {
    const p = this.props;
    const st = p.store;
    st.toggle('help');
  }


  render() {
    const s = this.state;
    if (s.redirect) {
      return <Redirect push target="_black" to={`/${s.redirect}`} />;
    }
    let content;
    const p = this.props;
    const st = p.store;
    const helpInfo = (
      <div ref={this.content}>
        <div className="help-top">
          <Header>Help</Header>
          <Icon name="close" className="help-close" onClick={(e) => this.handleClose(e)} />
        </div>
        <div className="help-links">
          {/* This is not the way to do it! Maybe fix this */}
          <Link to="about" target="_blank" onClick={(event) => { event.preventDefault(); window.open(`http://${window.location.host}/about`); }}>
            <Button basic color="black">About</Button>
          </Link>
          <Link to="learn" target="_blank" onClick={(event) => { event.preventDefault(); window.open(`http://${window.location.host}/learn`); }}>
            <Button basic color="black">Learn</Button>
          </Link>
          <Link to="about" target="_blank" onClick={(event) => { event.preventDefault(); window.open(`http://${window.location.host}/help`); }}>
            <Button basic color="black">Tutorial</Button>
          </Link>
          <Link to="about" target="_blank" onClick={(event) => { event.preventDefault(); window.open(`http://${window.location.host}/feedback`); }}>
            <Button basic color="black">Feedback</Button>
          </Link>
        </div>
        <Header style={{ margin: '1em 0 0 0' }}>Controls</Header>
        <Controls />
        <Button
          primary
          className="help-close-button"
          onClick={() => this.handleClose()}
        >
    Close
        </Button>
      </div>
    );
    if (st.help && (window.innerWidth < 700 || window.innerHeight < 700)) {
      content = (
        <Modal
          className="help-modal"
          open
        >
          {helpInfo}
        </Modal>
      );
    } else if (st.help) {
      content = (
        <Segment
          open
          className="help-window"
        >
          {helpInfo}
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

HelpWindow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};

HelpWindow.defaultProps = {
  store: {},
};

export default withStore(HelpWindow);
