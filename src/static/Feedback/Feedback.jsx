import React from 'react';
import { Header } from 'semantic-ui-react';

import '../pagebase.css';
import NavBar from '../NavBar/NavBar';

function Feedback() {
  return (
    <div>
      <NavBar />
      <div className="about-wrapper">
        <div className="about-container">
          <Header as="h1">Feedback</Header>
          <p>
            Thanks for taking time to try out Mandelbrot Maps!
            Answering the following questions will help guide future improvements to the system.
          </p>
          <iframe title="feedback-form" src="https://docs.google.com/forms/d/e/1FAIpQLSeeWnYqnnegTZPjL2TwdapJYn5YZzcNPD9xFCEGThP_bFSS2A/viewform?embedded=true" scrolling="no" style={{ maxWidth: 640, width: '100%' }} height="2661" frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe>
          {' '}

        </div>
      </div>
    </div>
  );
}

export default Feedback;
