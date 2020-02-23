import React from 'react';
import { Header } from 'semantic-ui-react';
import { LoremIpsum } from 'lorem-ipsum';
import '../pagebase.css';
import NavBar from '../NavBar/NavBar';

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
      <NavBar />
      <div className="about-wrapper">
        <div className="about-container">
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
      </div>
    </div>
  );
}

export default Help;
