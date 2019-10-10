import React, { useState, useEffect }  from 'react';
import './App.css';
import Mandelbrot from './Mandelbrot/Mandelbrot'
class App extends React.Component {
  componentDidMount() {
    this.loadWasm();
  }
  loadWasm = async () => {
    try {
      const wasm = await import('mmap');
      this.setState({wasm});
      wasm.greet();
    } catch(err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  };
  render() {
    return (
      <div className="App">
        <Mandelbrot></Mandelbrot>
      </div>
    );
  }
}

export default App;
