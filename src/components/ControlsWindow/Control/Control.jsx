/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import Key from '../Key/Key';
import './Control.css';

export default function Control(props) {
  const p = props;
  return (
    <div className="control-row">
      {(p.type === 'text') ? <span className="control-text">{p.text}</span> : <Key {...p} />}
      <span className="control-desc">{p.description}</span>
    </div>
  );
}

Control.propTypes = {
  type: PropTypes.string,
  text: PropTypes.string,
  description: PropTypes.string,
};

Control.defaultProps = {
  type: PropTypes.string,
  text: PropTypes.string,
  description: PropTypes.string,
};
