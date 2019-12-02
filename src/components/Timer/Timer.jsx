import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Timer.css';

export default class Timer extends Component {
  constructor(props) {
    super(props);
    this.prevTime = [];
    this.meanTime = 0;
  }

  updateTime(time) {
    const getSum = (p, c) => (p + c);
    this.prevTime.push(time);
    this.meanTime = Math.round(this.prevTime.reduce(getSum, 0) / this.prevTime.length);
  }

  render() {
    const p = this.props;
    const lastTime = `Last Time:${p.time}ms`;
    const averageTime = `Average Time:${this.meanTime}ms`;
    return (
      <div className="timer-container">
        <strong>Timer</strong>
        <div>{lastTime}</div>
        <div>{averageTime}</div>

      </div>
    );
  }
}
Timer.propTypes = {
  time: PropTypes.number,
};

Timer.defaultProps = {
  time: 200,
};
