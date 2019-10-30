import React from 'react';
import './App.css';
import MandelbrotViewer from './components/MandelbrotViewer'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";

import { disableBodyScroll } from 'body-scroll-lock';
import Mode from './utils/RenderMode'
const AppRouter = () => {
  disableBodyScroll(document.querySelector('#app'))
  return (
    <Router>
      <Switch >
        <Route path="/:renderMode?/:iterations?" children={<App id="app" />}></Route>
      </Switch>
    </Router>
  )
}

const App = () => {
  let {renderMode,iterations} = useParams()
  let mode;
  if (renderMode === "javascript") {
    mode = Mode.JAVASCRIPT
  } else if (renderMode === "wasm") {
    mode = Mode.WASM
  } else {
    mode = Mode.JAVASCRIPT
  }
  iterations = (iterations) ? iterations : 200
  return (
      <div className="App">
        <MandelbrotViewer maxi={iterations} renderMode={mode}></MandelbrotViewer>
      </div>
  );
}

export default AppRouter;
