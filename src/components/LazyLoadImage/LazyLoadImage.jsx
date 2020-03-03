import React from 'react';
import PropTypes from 'prop-types';
import { Visibility, Image, Placeholder } from 'semantic-ui-react';

export default class LazyLoadIamge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

    showImage = () => {
      this.setState({
        show: true,
      });
    }

    render() {
      const p = this.props;
      const s = this.state;
      if (!s.show) {
        return (
          <Visibility as="span" onOnScreen={this.showImage}>
            <Placeholder style={{ width: '100%', height: '100%' }}>
              <Placeholder.Image square />
            </Placeholder>
          </Visibility>
        );
      }
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <Image {...p} />;
    }
}

LazyLoadIamge.propTypes = {
  src: PropTypes.string.isRequired,
  size: PropTypes.string,
};

LazyLoadIamge.defaultProps = {
  size: 'medium',
};
