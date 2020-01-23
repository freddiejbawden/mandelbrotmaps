import React from 'react';
import {
  Input, Grid,
} from 'semantic-ui-react';
import '../OptionAll.css';

const OptionText = (p) => {
  let optionsClasses = 'option-container';
  if (p.disabled) {
    optionsClasses += ' options-disabled';
  }
  const inputRef = React.createRef();
  const checkValid = (val) => {
    if (val < (p.limit || 1000)) {
      p.callback(val);
    }
    // provide error feedback
  };

  return (
    <Grid.Row className={optionsClasses}>
      <Grid.Column textAlign="left" className="option-meta-container">
        <h3>{p.name}</h3>
        <span className="option-description">
          {p.description}
        </span>
      </Grid.Column>
      <Grid.Column textAlign="right">
        <Input
          type="number"
          value={p.value}
          ref={inputRef}
          disabled={p.disabled}
          placeholder={(p.placeholder || 200)}
          onChange={(e) => checkValid(e.target.value)}
          labelPosition="right"
        />
      </Grid.Column>
    </Grid.Row>
  );
};

export default OptionText;
