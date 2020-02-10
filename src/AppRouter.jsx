import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import App from './App';
import { createStore } from './statemanagement/createStore';

const AppWithStore = createStore(App);

const AppRouter = () => (
  <Router>
    <Switch>
      <Route path="/:renderMode?/:iterations?">
        <AppWithStore id="app" />
      </Route>
    </Switch>
  </Router>
);
export default AppRouter;
