import React from 'react';
import { Header } from 'semantic-ui-react';
import { LoremIpsum } from 'lorem-ipsum';
import '../pagebase.css';
import NavBar from '../NavBar/NavBar';

function Learn() {
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
          <Header as="h1">Learn</Header>
          <p>
            <strong>
              This page will contain information about the fractals and how they are formed
            </strong>
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

export default Learn;
