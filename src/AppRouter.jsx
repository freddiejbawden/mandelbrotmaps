import React from 'react';
import { disableBodyScroll } from 'body-scroll-lock';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import App from './App';
import { createStore } from './statemanagement/createStore';

const AppWithStore = createStore(App);

const AppRouter = () => {
  disableBodyScroll(document.querySelector('#app'));
  return (
    <Router>
      <Switch>
        <Route path="/:renderMode?/:iterations?">
          <AppWithStore id="app" />
        </Route>
      </Switch>
    </Router>
  );
};

export default AppRouter;
