import React from 'react';
import PropTypes from 'prop-types';

import './Nerdbar.css';

const Nerdbar = (props) => {
  const stats = [];
  const p = props;
  let i = 0;
  Object.keys(p.stats).forEach((key) => {
    const stat = p.stats[key];
    stats.push(
      <span key={i}>
        {stat.label}: {stat.value}
      </span>,
    );
    i += 1;
  });
  return (
    <div className="nerd-bar-container ">
      {stats}
    </div>
  );
};

Nerdbar.propTypes = {
  stats: PropTypes.object,
};
Nerdbar.defaultProps = {
  data: [],
};

export default Nerdbar;
