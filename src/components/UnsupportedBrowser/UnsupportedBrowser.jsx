import React, { useState } from 'react';
import { Modal, Button, Checkbox } from 'semantic-ui-react';
import { getSupportText } from '../../utils/checkSupported';
import './UnsupportedBrowser.css';

export default function UnsupportedBrowser() {
  const [visible, setVisible] = useState(true);
  const checkBoxRef = React.createRef();

  const updateVisibility = () => {
    const remind = checkBoxRef.current.state.checked;
    if (remind) {
      window.localStorage.setItem('understandUnsupported', remind);
    }
    setVisible(false);
  };

  return (
    <Modal
      open={visible}
      size="small"
    >
      <div className="unsupported-browser-message-container">
        <h1>Warning!</h1>
        <p>{getSupportText()}</p>
        <p>
For the full experience try
          {' '}
          <a href="https://www.mozilla.org/en-GB/firefox/new/">Firefox</a>
          ,
          {' '}
          <a href="https://www.google.com/intl/en_uk/chrome/">Chrome</a>
          {' '}
          or
          {' '}
          <a href="https://www.microsoft.com/en-us/edge">Edge</a>

        </p>
        <Button primary className="continue-button" onClick={() => updateVisibility()}> I understand </Button>
        <br />
        <Checkbox label={{ children: 'Don\'t remind me again' }} ref={checkBoxRef} id="dont-remind" />
      </div>
    </Modal>
  );
}
