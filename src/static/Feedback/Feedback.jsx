import React from 'react';
import { Header } from 'semantic-ui-react';
import createPage from '../Page/Page';

import '../pagebase.css';

function Feedback() {
  return (
    <div>
      <Header as="h1">Feedback</Header>
      <div>
        <p>
              Thanks for taking time to try out Mandelbrot Maps! Answering the
              following questions will help guide future improvements to the system.
        </p>
        <p>
          <i>
            This study was certified according to the Informatics Research Ethics
            Process, RT number 2019/17630. For more information, please read the included
            {' '}
            <a href="Please read the information sheet available here before beginning this survey: https://github.com/freddiejbawden/mandelbrotmaps/blob/develop/information_sheet_form.pdf">information sheet.</a>
          </i>
        </p>
        <iframe title="feedback-form" src="https://docs.google.com/forms/d/e/1FAIpQLSeeWnYqnnegTZPjL2TwdapJYn5YZzcNPD9xFCEGThP_bFSS2A/viewform?embedded=true" width="640" height="2645" style={{ maxWidth: 640, width: '100%' }} frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe>
      </div>
      {' '}
    </div>
  );
}

export default createPage(Feedback);
