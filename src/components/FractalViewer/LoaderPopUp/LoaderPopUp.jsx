import React from 'react';
import { Loader } from 'semantic-ui-react';
import './LoaderPopUp.css';

function LoaderPopUp(props) {
  const p = props;
  return (
    <div style={{ display: (p.show) ? 'block' : 'none' }} className="loader-container">
      <Loader active inline />
    </div>
  );
}

export default LoaderPopUp;
