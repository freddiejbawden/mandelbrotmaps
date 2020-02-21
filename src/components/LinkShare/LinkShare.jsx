import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Portal, Segment, Header, Input,
} from 'semantic-ui-react';

import { withStore } from '../../statemanagement/createStore';

class LinkShare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      buttonText: 'Copy',
    };
    this.copyInput = React.createRef();
  }

  handleOpen = () => this.setState({
    modalOpen: true,
  })

  handleClose = () => this.setState({ modalOpen: false })

  copyLink = () => {
    this.copyInput.current.select();
    document.execCommand('copy');
    this.setState({ buttonText: 'Copied!' });
  }

  render() {
    const s = this.state;
    const p = this.props;
    const defaultValue = (p.store.toURL) ? p.store.toURL() : '';

    return (
      <div>
        <Button
          size="large"
          onClick={this.handleOpen}
          circular
          icon="share"
        />

        <Portal onClose={this.handleClose} open={s.modalOpen}>
          <Segment
            style={{
              left: '50%',
              position: 'fixed',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <Header>Share Fractal</Header>
            <p>Send this link to share the current fractals</p>
            <Input
              disabled={!p.store.toURL}
              ref={this.copyInput}
              action={{
                onClick: this.copyLink,
                color: 'teal',
                labelPosition: 'right',
                icon: 'copy',
                content: s.buttonText,
              }}
              defaultValue={defaultValue}
            />
            <br />
            <Button
              style={{
                marginTop: '20px',
              }}
              content="Close"
              negative
              onClick={this.handleClose}
            />
          </Segment>
        </Portal>
      </div>

    );
  }
}

LinkShare.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};
LinkShare.defaultProps = {
  store: {},
};

export default withStore(LinkShare);
