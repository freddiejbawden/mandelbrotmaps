import React, { useState } from 'react';

import { getSupportText } from '../../utils/checkSupported';
import './UnsupportedBrowser.css';

export default function UnsupportedBrowser() {
  const [visible, setVisible] = useState(true);
  const visibility = (visible) ? 'unsupported-browser-container' : 'unsupported-browser-container-hidden';
  const checkBoxRef = React.createRef();

  const updateVisibility = () => {
    if (checkBoxRef.current.checked) {
      window.localStorage.setItem('understandUnsupported', true);
    }
    setVisible(false);
  };

  return (
    <div className={visibility}>
      <div className="blocker" />
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
        <div onKeyDown={() => updateVisibility()} tabIndex={0} role="button" className="continue-button" onClick={() => updateVisibility()}> I understand </div>
        <p className="dont-remind">
          {'Don\'t remind me again'}
          <input ref={checkBoxRef} type="checkbox" id="dont-remind" />
        </p>
      </div>
    </div>
  );
}
