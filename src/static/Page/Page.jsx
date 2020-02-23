/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import NavBar from '../NavBar/NavBar';

import '../pagebase.css';

export default (WrappedComponent) => {
  const createPage = ({ ...props }) => (
    <div>
      <NavBar />
      <div className="about-wrapper">
        <div className="about-container">
          <WrappedComponent {...props} />
        </div>
      </div>
    </div>
  );

  createPage.propTypes = {
  };

  return createPage;
};
