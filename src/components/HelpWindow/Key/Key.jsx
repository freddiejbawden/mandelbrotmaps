import React from 'react';
import { Icon } from 'semantic-ui-react';

import './Key.css';

export default function Key(props) {
  const keys = [];
  const p = props;
  for (let i = 0; i < p.keys.length; i += 1) {
    let keySymb;
    if (p.keys[i].includes(' ')) {
      keySymb = <span key={i} className="key"><Icon name={p.keys[i]} size="small" /></span>;
    } else {
      keySymb = <span key={i} className="key">{p.keys[i]}</span>;
    }
    keys.push(
      <span className="key-wrapper">
        {keySymb}
        {(i < p.keys.length - 1 && p.join) ? <span>+</span> : ''}
      </span>,
    );
  }
  return (
    <span className="key-container">
      { keys }
    </span>
  );
}
