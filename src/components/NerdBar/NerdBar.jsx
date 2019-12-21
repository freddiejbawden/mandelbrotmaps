import React from 'react';

import './Nerdbar.css';

const Nerdbar = (props) => {
  const stats = [];
  const p = props;
  let i = 0;
  Object.keys(p.stats).forEach((key) => {
    const stat = p.stats[key];
    const content = `${stat.label}: ${stat.value}`;
    stats.push(
      <span key={i}>{content}</span>,
    );
    i += 1;
  });
  return (
    <div className="nerd-bar-container ">
      {stats}
    </div>
  );
};

export default Nerdbar;
