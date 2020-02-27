import React from 'react';
import { Modal, Button } from 'semantic-ui-react';
import './WelcomeModal.css';
import { Redirect } from 'react-router-dom';


class WelcomeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      redirect: false,
    };
    this.checkBoxRef = React.createRef();
  }

  redirect = () => {
    this.setState({
      redirect: true,
    });
  }

  updateVisibility = () => {
    window.localStorage.setItem('firstTime', true);
    this.setState(() => ({
      visible: false,
    }));
  };

  render() {
    const s = this.state;
    if (s.redirect) {
      window.localStorage.setItem('firstTime', true);
      return (<Redirect to="/help" />);
    }
    return (
      <Modal
        open={s.visible}
        size="small"
      >
        <div className="unsupported-browser-message-container">
          <h1>Welcome To Mandelbrot Maps</h1>
          <p>
              This looks like your first time using the application,
              you might want to take a quick tutorial before jumping in.
              If not, you can access the tutorial any time by opening the
            {' '}
            <strong>help</strong>
            {' '}
    menu.
          </p>
          <div>
            <Button style={{ marginBottom: '10px' }} primary className="continue-button" onClick={() => this.redirect()}>Go To Tutorial!</Button>
            <Button basic color="black" className="continue-button" onClick={() => this.updateVisibility()}>Take me to the app!</Button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default WelcomeModal;
