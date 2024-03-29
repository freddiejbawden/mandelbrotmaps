import React from 'react';

import './DebugBar.css';
import { withStore } from '../../statemanagement/createStore';

const DebugBar = (props) => {
  const stats = [];
  const p = props;
  let i = 0;
  let className;
  if (p.store) {
    className = (p.store.showDebugBar) ? 'debug-bar-container' : 'debug-bar-hide';
    Object.keys(p.store.stats).forEach((key) => {
      const stat = p.store.stats[key];
      const content = `${stat.label}: ${stat.value}${stat.unit}`;
      stats.push(
        <span key={i}>{content}</span>,
      );
      i += 1;
    });
  }

  return (
    <div className={className}>
      {stats}
    </div>
  );
};

export default withStore(DebugBar);
