import React, { Component } from 'react'
import './Settings.css'
export default class Settings extends Component {
  constructor(props) {
    super(props)
    this.iterationUpdateTimer = undefined;
    this.iterations = 200;
  }
  
  updateIterations(i) {
    this.iterations = i
    if (this.iterationUpdateTimer) clearTimeout(this.iterationUpdateTimer)
    this.iterationUpdateTimer = setTimeout(() => {
      this.props.updateIter(i)
    }, 1000)

  }
  updateRenderMethod(val) {
    this.props.updateRenderMethod(val);
  }
  render() {
    
    return (
      <div className="settings-container ">
        <strong>Settings</strong>
        <div >
          <label>Iteration Count:</label> <input type="number" defaultValue={200}onChange={event => this.updateIterations(event.target.value)} id="iterations"></input>
        </div>
        <div >
          <label>Pixel Size:</label> <input type="number" defaultValue={1}onChange={event => this.updateIterations(event.target.value)} id="iterations"></input>
        </div>
        <div>
          <label>Render Method</label>
          <select defaultValue={this.props.selectedRenderMode} onChange={event => this.updateRenderMethod(event.target.value)}>
            <option value="javascript" >Javascript</option>
            <option value="wasm">WASM + Rust (Single Thread)</option>
          </select> 
        </div>
        
      </div>
    )
  }
}
