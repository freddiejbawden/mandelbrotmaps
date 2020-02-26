import React from 'react';
import { Segment, Header, Image } from 'semantic-ui-react';

export default function HelpCard(props) {
  const p = props;
  return (
    <Segment>
      <Header>{p.title}</Header>
      <p>{p.description}</p>
      <Image />
    </Segment>
  );
}
