import React from 'react';
import { Header } from 'semantic-ui-react';
import Control from '../Control/Control';

export default function Controls() {
  return (
    <div className="details-container">
      <div>
        <Header as="h4">Keyboard</Header>
        <div className="help-container">
          <Control keys={['Shift', 'Arrow']} description="Move Julia Pin" join />
          <Control keys={['Arrow']} description="Move focused fracal" join />
          <Control keys={['+', '-']} description="Zoom" />
          <Control keys={['1']} description="Change focus to Mandelbrot" />
          <Control keys={['2']} description="Change focus to Julia" />
          <Control keys={['C']} description="Centre Julia Pin" />
          <Control keys={['R']} description="Reset Fractals" />
          <Control keys={['S']} description="Open Settings Menu" />
          <Control keys={['H']} description="Open Help Menu" />
        </div>
      </div>
      <div className="divider" />
      <div>
        <Header as="h4">Mouse</Header>
        <div className="help-container">
          <Control type="text" text="Click + Drag" description={'Pan Fractal /\n Move Julia Pin'} />
          <Control type="text" text="Scroll" description="Zoom Fractal" />
        </div>
        <Header as="h4">Trackpad</Header>
        <div className="help-container">
          <Control type="text" text="Click + Drag" description={'Pan Fractal /\n Move Julia Pin'} />
          <Control type="text" text="Scroll / Pinch" description="Zoom Fractal" />
        </div>
        <Header as="h4">Touch</Header>
        <div className="help-container">
          <Control type="text" text="Touch + Drag" description="Pan Fractal" />
          <Control type="text" text="Pinch / Double Tap" description="Zoom Fractal" />
        </div>
      </div>
    </div>
  );
}
