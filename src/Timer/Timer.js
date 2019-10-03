import React, { Component } from 'react'
import './Timer.css'
export default class Timer extends Component {
  constructor(props) {
    super(props)
    this.prevTime = []
    this.meanTime = 0
    this.state = {
      time: 0
    }
  }
  updateTime(time) {
    this.prevTime.push(time)
    this.meanTime = Math.round(this.prevTime.reduce((p,c) => c += p)/this.prevTime.length*100)/100
    this.setState({time});
  }
  render() {
    return (
      <div className="timer-container">
        <strong>Timer</strong>
        <div>Last Time: {this.state.time}ms</div>
        <div>Average Time: {this.meanTime}ms</div>

      </div>
    )
  }
}
