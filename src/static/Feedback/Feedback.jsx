import React, { useState, useEffect } from 'react';
import { Header } from 'semantic-ui-react';
import createPage from '../Page/Page';

import '../pagebase.css';

function Feedback() {
  const [imageSrc, setSrc] = useState(0);
  useEffect(() => {
    // Update the document title using the browser API
    fetch('https://dog.ceo/api/breeds/image/random')
      .then((res) => res.json()
        .then((data) => setSrc(data.message)));
  }, []);
  return (
    <div>
      <Header as="h1">Feedback</Header>
      <p>
        Thanks for taking time to try out Mandelbrot Maps!
        We are still awaiting ethics approval for user testing. Check back soon&#8482;.
      </p>
      <p>
        In the meantime here is a dog (thanks to
        {' '}
        <a href="https://dog.ceo/dog-api/">Dog CEO</a>
        {' '}
for this amazing api)
      </p>
      <br />
      <div style={{ width: '100%', textAlign: 'center' }}>
        <img
          style={{ maxWidth: '100%' }}
          alt="woof"
          src={imageSrc}
        />
      </div>
      <div style={{ display: 'none' }}>
        <p>
              Thanks for taking time to try out Mandelbrot Maps!
              Answering the following questions will help guide future improvements to the system.
        </p>
        <iframe title="feedback-form" src="https://docs.google.com/forms/d/e/1FAIpQLSeeWnYqnnegTZPjL2TwdapJYn5YZzcNPD9xFCEGThP_bFSS2A/viewform?embedded=true" scrolling="no" style={{ maxWidth: 640, width: '100%' }} height="2661" frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe>

      </div>
      {' '}
    </div>
  );
}

export default createPage(Feedback);
