import React, { Component } from 'react'
import './Settings.css'
import DelayedInput from '../DelayedInput';
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
        <DelayedInput label={"Iteration Count"} type="number" defaultValue={200} callback={this.props.updateIter} timeout={1000}></DelayedInput>
        <DelayedInput label={"Pixel Size"} type="number" defaultValue={0.003} callback={this.props.updatePixelSize} timeout={500}></DelayedInput>       
        <DelayedInput label={"Centre X"} type="number" defaultValue={-1} callback={this.props.updateCentreCoords} timeout={500}></DelayedInput>       
        <DelayedInput label={"Centre Y"} type="number" defaultValue={0} callback={this.props.updateCentreCoords} timeout={500}></DelayedInput>  
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
