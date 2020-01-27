import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import Settings from '../Settings/Settings';
import './SideBar.css';
import { withStore } from '../../statemanagement/createStore';

class SideBar extends Component {
  centreJulia() {
    const p = this.props;
    const st = p.store;
    st.set({
      centreJulia: true,
    });
  }

  render() {
    return (
      <div className="side-bar-container">
        <div>
          <Settings />
        </div>
        <div>
          <Button
            onClick={() => this.centreJulia()}
            className="side-button"
            size="large"
            circular
            icon="crosshairs"
          />
        </div>

      </div>
    );
  }
}
SideBar.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object.isRequired,
};
export default withStore(SideBar);
