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
      </div>
    )
  }
}
