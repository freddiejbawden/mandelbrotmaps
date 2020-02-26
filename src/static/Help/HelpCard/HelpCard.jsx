import React from 'react';
import PropTypes from 'prop-types';
import {
  Segment, Header, Image, Accordion, Icon,
} from 'semantic-ui-react';
import HelpImages from '../helpImages/helpImages';

import './HelpCard.css';

export default class HelpCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { opened: false };
  }

  handleClick = () => {
    this.setState((prevState) => ({
      opened: !prevState.opened,
    }));
  }

  render() {
    const p = this.props;
    const images = [];
    if (p.image) {
      for (let i = 0; i < p.image.length; i += 1) {
        images.push(
          <Image key={i} style={{ marginBottom: '10px' }} src={HelpImages[p.image[i]]} />,
        );
      }
    }
    const s = this.state;
    return (
      <Accordion style={{ marginBottom: '20px' }}>
        <Segment className="help-card-container">
          <Accordion.Title active={s.opened} onClick={this.handleClick}>
            <Header>
              {' '}
              <Icon name="dropdown" />
              {p.title}
            </Header>
          </Accordion.Title>
          <Accordion.Content active={s.opened}>
            {p.description}
            {images}
          </Accordion.Content>
        </Segment>
      </Accordion>
    );
  }
}

HelpCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.element.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  image: PropTypes.array,
};

HelpCard.defaultProps = {
  image: [],
};
