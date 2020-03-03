import React from 'react';
import '../OptionAll.css';
import { Dropdown, Grid } from 'semantic-ui-react';


const OptionSpinner = (p) => {
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
        <Dropdown value={p.value} fluid scrolling onChange={(e, { value }) => p.callback(value)} closeOnChange selection placeholder="Select A Render Option" options={p.options} />
      </Grid.Column>
    </Grid.Row>
  );
};

export default OptionSpinner;
