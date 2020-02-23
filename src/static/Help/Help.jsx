import React from 'react';
import { Header } from 'semantic-ui-react';
import { LoremIpsum } from 'lorem-ipsum';
import '../pagebase.css';
import createPage from '../Page/Page';

function Help() {
  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4,
    },
    wordsPerSentence: {
      max: 16,
      min: 4,
    },
  });
  return (
    <div>
      <Header as="h1">Help</Header>
      <p>
        <strong>This page will contain a tutorial about how to use the application</strong>
      </p>
      <p>
        {lorem.generateParagraphs(1)}
      </p>
      <p>
        {lorem.generateParagraphs(1)}
      </p>
      <p>
        {lorem.generateParagraphs(1)}
      </p>
      <p>
        {lorem.generateParagraphs(1)}
      </p>
    </div>

  );
}

export default createPage(Help);
