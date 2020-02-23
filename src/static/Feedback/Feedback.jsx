import React from 'react';
import { Header } from 'semantic-ui-react';
import createPage from '../Page/Page';

import '../pagebase.css';

function Feedback() {
  return (
    <div>
      <Header as="h1">Feedback</Header>
      <p>
            Thanks for taking time to try out Mandelbrot Maps!
            Answering the following questions will help guide future improvements to the system.
      </p>
      <iframe title="feedback-form" src="https://docs.google.com/forms/d/e/1FAIpQLSeeWnYqnnegTZPjL2TwdapJYn5YZzcNPD9xFCEGThP_bFSS2A/viewform?embedded=true" scrolling="no" style={{ maxWidth: 640, width: '100%' }} height="2661" frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe>
      {' '}
    </div>
  );
}

export default createPage(Feedback);
