import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Menu, Icon,
} from 'semantic-ui-react';
import { Redirect, withRouter } from 'react-router-dom';
import './navbar.css';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
      visible: false,
      vertical: (window.innerWidth < 600),
    };
  }

  componentDidMount = () => {
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize = () => {
    const s = this.state;
    if (window.innerWidth < 600 && !s.vertical) {
      this.setState({
        vertical: true,
        visible: false,
      });
    } else if (s.vertical) {
      this.setState({
        vertical: false,
        visible: false,
      });
    }
  }


  redirect = (link) => {
    // some action...
    // then redirect
    const p = this.props;
    if (link === p.location.pathname.substring(1)) {
      return;
    }
    this.setState({ redirect: link });
  }

  toggleMenu = () => {
    this.setState((prevState) => ({ visible: !prevState.visible }));
  }

  render() {
    const s = this.state;
    if (s.redirect) {
      return <Redirect push to={`/${s.redirect}`} />;
    }
    const menu = (
      <Menu visible={s.visible || !s.vertical} vertical={s.vertical} text={!s.vertical} className="navbar-menu">
        <Menu.Item onClick={() => this.redirect('about')}>
          About
        </Menu.Item>
        <Menu.Item onClick={() => this.redirect('learn')}>
          Learn
        </Menu.Item>
        <Menu.Item onClick={() => this.redirect('help')}>
          Help
        </Menu.Item>
        <Menu.Item onClick={() => this.redirect('feedback')}>
          Feedback
        </Menu.Item>
        <Menu.Item>
          <Button onClick={() => this.redirect('app')} className="open-app-button" primary>
          Open App
          </Button>
        </Menu.Item>
      </Menu>
    );
    const hamburger = (<Icon size="large" name={(s.visible) ? 'close' : 'bars'} onClick={this.toggleMenu} />);
    return (
      <div>
        <div className="navbar">
          <span className="navbar-text">Mandelbrot Maps</span>
          {(s.vertical) ? hamburger : ''}
          {(s.visible || !s.vertical) ? menu : ''}
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object,
};

NavBar.defaultProps = {
  location: '',
};
export default withRouter(NavBar);
