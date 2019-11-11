import React, { Component } from 'react';
import './Timer.css';

export default class Timer extends Component {
  constructor(props) {
    super(props);
    this.prevTime = [];
    this.meanTime = 0;
    this.state = {
      time: 0,
    };
  }

  updateTime(time) {
    const getSum = (p, c) => (p + c);
    this.prevTime.push(time);
    this.meanTime = Math.round(this.prevTime.reduce(getSum, 0) / this.prevTime.length);
    this.setState({ time });
  }

  render() {
    const times = this.state;
    const lastTime = `Last Time:${times.time}ms`;
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
