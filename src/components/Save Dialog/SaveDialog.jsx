import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Dropdown, Modal,
} from 'semantic-ui-react';
import FractalViewer from '../FractalViewer';
import FractalType from '../../utils/FractalType';

import './saveDialog.css';
import ColorMode from '../../Renderer/ColorOptions';
import { withStore } from '../../statemanagement/createStore';

class SaveDialog extends Component {
  constructor(props) {
    super(props);
    this.innerRef = React.createRef();
    this.downloadImage = this.downloadImage.bind(this);
  }

  downloadImage() {
    const link = document.createElement('a');
    link.download = 'fractal.png';
    link.href = this.innerRef.current.toDataURL();
    link.click();
  }

  render() {
    const trigger = (
      <Button
        className="side-button"
        size="large"
        circular
        icon="save"
      />
    );
    const resolutions = [
      { key: 0, value: '640x480', text: '640 x 480' },
      { key: 1, value: '1440x1280', text: '1440 x 1280' },
    ];
    const fractalTypes = [
      { key: 0, value: FractalType.MANDELBROT, text: 'Mandelbrot' },
      { key: 1, value: FractalType.JULIA, text: 'Julia' },
      { key: 2, value: 2, text: 'Both' },
    ];
    const colorOptions = [
      { key: 1, value: ColorMode.BLACKANDWHITE, text: 'Black and White' },
      { key: 2, value: ColorMode.RAINBOW, text: 'Rainbow' },
      { key: 3, value: ColorMode.STRIPES, text: 'Striped' },
    ];
    const p = this.props;
    const { store } = p;
    return (
      <Modal trigger={trigger}>
        <Modal.Header>Export Image</Modal.Header>
        <div className="save-dialog-fractal-viewer">
          <span> Preview</span>
          <FractalViewer
            id="fractal-viewer-save"
            type={FractalType.JULIA}
            innerRef={this.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...store}
          />
          <div className="export-settings">
            <Dropdown fluid scrolling placeholder="Export Resolution" options={resolutions} closeOnChange selection />
            <Dropdown fluid scrolling placeholder="Fractal Type" options={fractalTypes} closeOnChange selection />
            <Dropdown fluid scrolling placeholder="Coloring Mode" options={colorOptions} closeOnChange selection />
          </div>
          <div>
            <Button primary onClick={this.downloadImage}>Download Image</Button>
            <Button negative>Cancel</Button>
          </div>
        </div>
      </Modal>
    );
  }
}
SaveDialog.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
};

SaveDialog.defaultProps = {
  store: {},
};

export default withStore(SaveDialog);
