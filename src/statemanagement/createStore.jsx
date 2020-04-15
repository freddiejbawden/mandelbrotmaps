/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-classes-per-file */

import React from 'react';
import parser from 'ua-parser-js';
import initialState from './initialState';
import Mode from '../Renderer/RenderMode';

const StoreContext = React.createContext();
// Adapted From https://itnext.io/manage-react-state-without-redux-a1d03403d360

const createStore = (WrappedComponent) => class extends React.Component {
    // eslint-disable-next-line react/state-in-constructor
    state = {
      // eslint-disable-next-line react/destructuring-assignment
      /**
       * Convert current state value to URL
       */
      toURL: () => {
        const serialize = (obj) => {
          const str = [];
          Object.keys(obj).forEach((p) => {
            if (typeof obj[p] !== 'function' && p !== 'stats') {
              if (p in obj) {
                str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
              }
            }
          });
          return str.join('&');
        };
        return `${window.location.host}/app/?${serialize(this.state)}`;
      },
      /**
       * Return value of key
       * @param key
       */
      get: (key) => {
        const { state } = this.state;
        return state[key];
      },
      /**
       * Set value of key
       * @param updates, array of key value pairs
       */
      set: (updates) => {
        const { state } = this;
        Object.keys(updates).forEach((key) => {
          const value = updates[key];
          state[key] = value;
        });
        this.setState(state);
      },
      /**
       * Remove a value from the state
       * @param key
       */
      remove: (key) => {
        const { state } = this;
        delete state[key];
        this.setState(state);
      },
      /**
       *
       */
      toggle: (key) => {
        const { state } = this;
        if ((typeof state[key]) === 'boolean') {
          state[key] = !state[key];
          this.setState(state);
        } else {
          // eslint-disable-next-line no-console
          console.warn(`Cannot toggle key ${key} as it is not a boolean`);
        }
      },
      /**
       * Update a stat
       * @param updates Array of stats to update
       */
      setStat: (updates) => {
        const { state } = this;
        Object.keys(updates).forEach((key) => {
          state.stats[key].value = updates[key];
        });
        this.setState(state);
      },
      ...initialState,
      ...this.getParams(),
      ...this.defaultRenderer(),
    }

    /**
     * Parse the URL and update the state
     */
    // eslint-disable-next-line class-methods-use-this
    getParams() {
      const search = window.location.href.split('?')[1];
      if (!search || search === '') return {};
      const jsonifiedSearch = search.replace(/&/g, '","').replace(/=/g, '":"');
      const j = JSON.parse(`{"${jsonifiedSearch}"}`, (key, value) => (key === '' ? value : decodeURIComponent(value)));
      Object.keys(j).forEach((key) => {
        const value = j[key];
        // is it a number?
        // eslint-disable-next-line no-restricted-globals
        if (!isNaN(value)) {
          j[key] = parseFloat(value);
        } else if (value === 'false') {
          j[key] = false;
        } else if (value === 'true') {
          j[key] = true;
        } else if (value.match(/(-?([0-9](.[0-9]+)*,? *))+/g)) {
          j[key] = value.split(',').map((x) => parseFloat(x, 10));
        }
      });
      return j;
    }

    /**
     * Set the default renderer depending on the engine
     */
    // eslint-disable-next-line class-methods-use-this
    defaultRenderer() {
      const uaData = parser(navigator.userAgent);
      const isBlink = uaData.engine.name === 'Blink';
      return {
        renderMode: (isBlink) ? Mode.JAVASCRIPTMT : Mode.WASMMT,
      };
    }

    /**
     * Render function attaches the state value
     */
    render() {
      return (
        <StoreContext.Provider value={this.state}>
          <WrappedComponent {...this.props} />
        </StoreContext.Provider>
      );
    }
};

/**
 * Attaches a store to the passed component
 * @param {*} WrappedComponent component to attach store to
 */
// eslint-disable-next-line react/prefer-stateless-function
const withStore = (WrappedComponent) => class extends React.Component {
  render() {
    return (
      <StoreContext.Consumer>
        {(context) => <WrappedComponent store={context} {...this.props} />}
      </StoreContext.Consumer>
    );
  }
};

export { withStore, createStore };
