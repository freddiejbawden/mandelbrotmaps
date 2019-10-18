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
        <Route path="/:renderMode?/:iterations?" children={<App />}></Route>
      </Switch>
    </Router>
  )
}

const App = () => {
  let {renderMode,iterations} = useParams()
  renderMode =  (renderMode) ? renderMode : "javascript"
  iterations = (iterations) ? iterations : 200
  return (
      <div className="App">
        <Mandelbrot maxi={iterations} renderMode={renderMode}></Mandelbrot>
      </div>
  );
}

export default AppRouter;
