import React from 'react';
import { Header, Segment } from 'semantic-ui-react';
import '../pagebase.css';
import createPage from '../Page/Page';
import Controls from '../../components/HelpWindow/Controls/Controls';
import HelpCard from './HelpCard/HelpCard';

function Help() {
  return (
    <div>
      <Header as="h1">Help</Header>
      <p>
        <strong>This page will contain a tutorial about how to use the application</strong>
      </p>
      <HelpCard
        title="Pan"
        description="Click and drag or touch and drag to pan the fractal"
      />
      <HelpCard
        title="Zoom"
        description="Scroll or pinch to zoom the fractal"
      />
      <HelpCard
        title="Move The Julia Pin"
        description="Click and drag or touch and drag to move the julia pin"
      />
      <HelpCard
        title="Change the settings"
        description="Use the settings menu to change how the viewer looks"
      />
      <Segment>
        <Header>Controls</Header>
        <Controls />
      </Segment>
    </div>

  );
}

export default createPage(Help);
