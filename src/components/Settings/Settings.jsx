import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Settings.css';
import {
  Modal, Grid, Button,
} from 'semantic-ui-react';

import RenderMode from '../../Renderer/RenderMode';
import { withStore } from '../../statemanagement/createStore';
import OptionCheck from './OptionCheck/OptionCheck';
import OptionSpinner from './OptionSpinner/OptionSpinner';
import OptionText from './OptionText/OptionText';
import ColorMode from '../../Renderer/ColorOptions';
import ViewOptions from '../../utils/ViewOptions';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.iterationUpdateTimer = undefined;
    this.iterations = 200;
    this.updateIterations = this.updateIterations.bind(this);
    this.state = {
      modalOpen: false,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 83) {
        this.setState((prevState) => ({
          modalOpen: !prevState.modalOpen,
        }));
      }
      if (e.keyCode === 72) {
        const p = this.props;
        const st = p.store;
        st.toggle('help');
      }
    });
  }

  handleOpen = () => this.setState({
    modalOpen: true,
  })

  handleClose = () => this.setState({ modalOpen: false })

  updateIterations(i) {
    if (this.iterationUpdateTimer) clearTimeout(this.iterationUpdateTimer);
    const p = this.props;
    this.iterationUpdateTimer = setTimeout(() => {
      let iter;
      if (!i) {
        iter = 200;
      } else {
        iter = parseInt(i, 10);
      }
      p.store.setStat({ iterations: iter });
      p.store.set({
        customIterations: iter,
      });
    }, 300);
  }

  updateRenderMethod(val) {
    const p = this.props;
    p.store.setStat({
      renderMode: parseInt(val, 10),
    });
    p.store.set({ renderMode: parseInt(val, 10) });
  }

  toggleIterations() {
    const p = this.props;
    const st = p.store;
    st.toggle('overrideIterations');
  }

  updateColoringMethod(val) {
    const p = this.props;
    p.store.set({ coloringMode: parseInt(val, 10) });
  }

  updateViewMode(val) {
    const p = this.props;
    p.store.set({ viewMode: parseInt(val, 10) });
  }

  render() {
    const p = this.props;
    const st = p.store;
    const s = this.state;
    const renderOptions = [
      { key: 1, value: RenderMode.JAVASCRIPT, text: 'Javascript' },
      { key: 3, value: RenderMode.WASM, text: 'Web Assembly' },
      { key: 4, value: RenderMode.JAVASCRIPTMT, text: 'Javascript (Multi Threaded)' },
      { key: 5, value: RenderMode.WASMMT, text: 'Web Assembly (Multi Threaded)' },
    ];
    const colorOptions = [
      { key: 1, value: ColorMode.BLACKANDWHITE, text: 'Black and White' },
      { key: 2, value: ColorMode.RAINBOW, text: 'Rainbow' },
      { key: 3, value: ColorMode.STRIPES, text: 'Striped' },
    ];
    const viewOptions = [
      { key: 1, value: ViewOptions.SIDEBYSIDE, text: 'Side by Side' },
      { key: 2, value: ViewOptions.JULIA_DETATCHED, text: 'Detatched Viewer' },
      { key: 3, value: ViewOptions.MANDELBROT_FULLSCREEN, text: 'Fullscreen' },
    ];
    let defaultViewOption;
    if (
      st.viewMode === ViewOptions.JULIA_DETATCHED
      || st.viewMode === ViewOptions.MANDELBROT_DETATCHED
    ) {
      defaultViewOption = ViewOptions.JULIA_DETATCHED;
    } else if (
      st.viewMode === ViewOptions.MANDELBROT_FULLSCREEN
      || st.viewMode === ViewOptions.JULIA_FULLSCREEN
    ) {
      defaultViewOption = ViewOptions.MANDELBROT_FULLSCREEN;
    } else {
      defaultViewOption = ViewOptions.SIDEBYSIDE;
    }
    return (
      <Modal
        closeIcon
        trigger={(
          <Button
            size="large"
            onClick={this.handleOpen}
            circular
            icon="settings"
          />
        )}
        className="options-container"
        open={s.modalOpen}
        onClose={this.handleClose}
      >
        <Modal.Header>Settings</Modal.Header>
        <Modal.Content>
          <Grid columns="equal" verticalAlign="middle">
            <OptionCheck defaultChecked={st.overrideIterations} focus callback={() => this.toggleIterations()} name="Override Iteration Count" description="Override the automatic setting of iterations" />
            <OptionText placeholder={st.customIterations} focus={st.overrideIterations} callback={(iter) => this.updateIterations(iter)} disabled={!st.overrideIterations} name="Iteration Count" description="Set the number of iterations to a fixed value" />
            <OptionSpinner value={st.renderMode} callback={(data) => this.updateRenderMethod(data)} name="Render Mode" description="Method used to render the fractals" options={renderOptions} />
            <OptionSpinner value={st.coloringMode} callback={(data) => this.updateColoringMethod(data)} name="Color Scheme" description="Coloring used to draw the fractals" options={colorOptions} />
            <OptionSpinner value={defaultViewOption} callback={(data) => this.updateViewMode(data)} name="Layout Type" description="Change the arrangement of the fractal viewers" options={viewOptions} />
            <OptionCheck defaultChecked={st.showDebugBar} callback={() => st.toggle('showDebugBar')} name="Enable Debug Bar" description="Displays additional information about the fractal viewer" />
            <OptionCheck defaultChecked={st.showRenderTrace} callback={() => st.toggle('showRenderTrace')} name="Show Renderer Trace" description="Tint pixel depending on which renderer it came from (JS Only)" />
            <OptionCheck defaultChecked={st.focusHighlight} callback={() => st.toggle('focusHighlight')} name="Show Focus Indicator" description="Display an icon to show which fractal is being interacted with" />
            <OptionCheck defaultChecked={st.showJuliaPin} focus callback={() => st.toggle('showJuliaPin')} name="Show Julia Pin" description="Display the Julia Pin on the Mandelbrot Fractal (useful for screenshotting)" />

            {
              // Save button
            }
            <Grid.Row>
              <Grid.Column textAlign="center">
                <Button onClick={this.handleClose} size="large" primary>Save and Close</Button>
                <Button onClick={this.handleClose} size="large" basic color="black">Close</Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    );
  }
}
Settings.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};
Settings.defaultProps = {
  store: {},
};

export default withStore(Settings);
