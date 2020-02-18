import React, { Component } from 'react';
import {
  Button, Select, Modal,
} from 'semantic-ui-react';
import FractalViewer from '../FractalViewer';
import FractalType from '../../utils/FractalType';

import './saveDialog.css';

export default class SaveDialog extends Component {
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
      { key: 0, value: [640, 480], text: '640 x 480' },
      { key: 0, value: [1440, 1280], text: '1440 x 1280' },
    ];
    return (
      <Modal trigger={trigger}>
        <Modal.Header>Export Image</Modal.Header>
        <div className="save-dialog-fractal-viewer">
          <FractalViewer
            id="fractal-viewer"
            type={FractalType.JULIA}
            position={1}
            appRef={this.appRef}
          />
          <div className="export-settings">
            <Select placeholder="Export Resolution" options={resolutions} />
            <Select placeholder="Fractal Type" options={resolutions} />

            <Select placeholder="Color" options={resolutions} />


          </div>
          <div>
            <Button primary>Download Image</Button>
            <Button negative>Cancel</Button>
          </div>
        </div>
      </Modal>
    );
  }
}
