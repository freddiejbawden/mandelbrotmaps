import React from 'react';
import {
  Header, Icon,
} from 'semantic-ui-react';
import '../pagebase.css';
import createPage from '../Page/Page';
import Controls from '../../components/HelpWindow/Controls/Controls';
import HelpCard from './HelpCard/HelpCard';

class Help extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentlyActive: {},
    };
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { currentlyActive } = this.state;
    const newActiveList = currentlyActive;
    if (currentlyActive[index]) {
      newActiveList[index] = false;
    } else {
      newActiveList[index] = true;
    }
    this.setState({ currentlyActive: newActiveList });
  }

  render() {
    return (
      <div style={{ maxWidth: '100%' }}>
        <Header as="h1">Help</Header>
        <p>
          We reccomend familiarising yourself with the interactions before starting
          the application to get full benefit from it. A quick reference can be opened
          at any time by pressing the
          {' '}
          <Icon name="help" circular />
          {' '}
button
        </p>
        <HelpCard
          title="Controls Quick Reference"
          description={<Controls />}
        />
        <HelpCard
          title="Pan"
          description={<p>Click and drag or touch and drag to pan the fractal</p>}
          image={['drag']}
        />
        <HelpCard
          title="Zoom"
          description={(
            <p>
Scroll or pinch to zoom the fractal.
            Alternativly double tap/click to zoom
            </p>
)}
          image={['zoom']}
        />
        <HelpCard
          title="Move The Julia Pin"
          description={(
            <p>
              Click and drag or touch and drag on the circular pin to move the julia pin
            </p>
          )}
          image={['dragJ', 'dragJMini']}
        />
        <HelpCard
          title="Centre The Julia Pin"
          description={(
            <p>
  Clicking the
              {' '}
              <i>centre</i>
              {' '}
              button
              {'  '}
              <Icon name="crosshairs" circular />
moves the Julia Pin to the centre of the screen
              {'  '}

              {' '}
  button
            </p>
  )}
          image={['centrePin']}
        />
        <HelpCard
          title="Reset The Fractals"
          description={(
            <p>
Click the reset button
              {' '}
              <Icon name="redo" circular />
              to reset the fractal back to its original zoom and position
            </p>
          )}
          image={['resetButton']}
        />
        <HelpCard
          title="Move The Fractal Frame"
          description={<p>Click and drag or touch and drag to move the frame</p>}
          image={['dragFrame']}
        />
        <HelpCard
          title="Swap The Frames"
          description={(
            <p>
  Clicking the swap will change the arrangement of the frames
              {'  '}
              <Icon name="exchange" circular />
              {' '}
  button
            </p>
  )}
          image={['changeFrame']}
        />
      </div>

    );
  }
}

export default createPage(Help);
