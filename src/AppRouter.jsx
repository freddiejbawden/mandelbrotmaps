import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import App from './App';
import About from './static/About';
import Learn from './static/Learn';
import Help from './static/Help';

import { createStore } from './statemanagement/createStore';
import Feedback from './static/Feedback/Feedback';

const AppWithStore = createStore(App);

const AppRouter = () => (
  <Router>
    <Switch>
      <Route path="/about">
        <About />
      </Route>
      <Route path="/learn">
        <Learn />
      </Route>
      <Route path="/help">
        <Help />
      </Route>
      <Route path="/feedback">
        <Feedback />
      </Route>
      <Route path="/app">
        <AppWithStore id="app" />
      </Route>
      <Route path="/">
        <Redirect push to="/app" />
      </Route>
    </Switch>
  </Router>
);
export default AppRouter;
