import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class DelayedInput extends Component {
  constructor(props) {
    const p = props;
    super(props);
    this.timer = undefined;
    if (!p.timeout) {
      p.timeout = 300;
    }
  }

  timerCallback(val) {
    const p = this.props;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      p.callback(val);
    }, p.timeout);
  }

  render() {
    const p = this.props;
    return (
      <div>
        <label htmlFor={p.label}>
          {p.label}
          {' '}
          <input
            id={p.label}
            type={p.type}
            defaultValue={p.defaultValue}
            onChange={(event) => this.timerCallback(event.target.value)}
          />
        </label>
      </div>
    );
  }
}
DelayedInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  defaultValue: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
  timeout: PropTypes.number.isRequired,
};
