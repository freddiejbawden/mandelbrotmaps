import React, { Component } from 'react'

export default class DelayedInput extends Component {
  constructor(props) {
    super(props);
    this.timer = undefined;
    if (!this.props.timeout) {
      this.props.timeout = 300
    }
  }
  timerCallback(val) {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.props.callback(val)
    }, this.props.timeout)
  }
  render() {
    return (
      <div >
          <label>{this.props.label}:</label> <input type={this.props.type} defaultValue={this.props.defaultValue} onChange={event => this.timerCallback(event.target.value)} id="iterations"></input>
        </div>
    )
  }
}
