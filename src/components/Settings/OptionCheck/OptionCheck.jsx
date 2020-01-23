import React from 'react';
import { Checkbox, Grid } from 'semantic-ui-react';

import '../OptionAll.css';

const OptionCheck = (p) => {
  let optionsClasses = 'option-container';
  if (p.disabled) {
    optionsClasses += ' options-disabled';
  }
  return (
    <Grid.Row className={optionsClasses}>
      <Grid.Column textAlign="left" className="option-meta-container">
        <h3>{p.name}</h3>
        <span className="option-description">
          {p.description}
        </span>
      </Grid.Column>
      <Grid.Column textAlign="right">
        <Checkbox defaultChecked={p.defaultChecked} onChange={p.callback} toggle />
      </Grid.Column>
    </Grid.Row>
  );
};

export default OptionCheck;
