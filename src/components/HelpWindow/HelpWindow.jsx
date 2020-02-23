import React, { Component } from 'react';
import {
  Segment, Modal, Header, Icon, Button,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
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
      return <Redirect push to={`/${s.redirect}`} />;
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
          <Button onClick={() => this.redirect('about')} basic color="black">About</Button>
          <Button onClick={() => this.redirect('learn')} basic color="black">Learn More</Button>
          <Button onClick={() => this.redirect('help')} basic color="black">Tutorial</Button>
          <Button onClick={() => this.redirect('feedback')} basic color="black">Feedback</Button>

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
