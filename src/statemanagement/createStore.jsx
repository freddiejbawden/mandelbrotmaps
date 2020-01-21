/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-classes-per-file */

import React from 'react';
import RenderMode from '../utils/RenderMode';

const StoreContext = React.createContext();
// Adapted From https://itnext.io/manage-react-state-without-redux-a1d03403d360

const createStore = (WrappedComponent) => class extends React.Component {
    // eslint-disable-next-line react/state-in-constructor
    state = {
      // eslint-disable-next-line react/destructuring-assignment
      get: (key) => this.state[key],
      set: (updates) => {
        const { state } = this;
        Object.keys(updates).forEach((key) => {
          const value = updates[key];
          state[key] = value;
        });
        this.setState(state);
      },
      remove: (key) => {
        const { state } = this;
        delete state[key];
        this.setState(state);
      },
      renderMode: RenderMode.JAVASCRIPT,
      iterations: 200,
      juliaPoint: [0, 0],
      mandelDragging: false,
    }

    render() {
      return (
        <StoreContext.Provider value={this.state}>
          <WrappedComponent {...this.props} />
        </StoreContext.Provider>
      );
    }
};

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
