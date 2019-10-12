import React, { useState, useEffect }  from 'react';
import './App.css';
import Mandelbrot from './Mandelbrot/Mandelbrot'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";
const AppRouter = () => {
  return (
    <Router>
      <Switch >
        <Route path="/:renderMode?" children={<App />}></Route>
      </Switch>
    </Router>
  )
}

const App = () => {
  let {renderMode} = useParams();
  renderMode = (renderMode) ? renderMode : "javascript";

  return (
      <div className="App">
        <Mandelbrot renderMode={renderMode}></Mandelbrot>
      </div>
  );
}

export default AppRouter;
