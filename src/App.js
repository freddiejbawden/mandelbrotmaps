import React, { useState, useEffect }  from 'react';
import './App.css';
import Mandelbrot from './Mandelbrot/Mandelbrot'
class App extends React.Component {
  
  render() {
    return (
      <div className="App">
        <Mandelbrot></Mandelbrot>
      </div>
    );
  }
}

export default App;
