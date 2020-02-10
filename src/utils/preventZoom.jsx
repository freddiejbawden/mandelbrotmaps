import React from 'react';

const preventZoom = (WrappedComponent) => class extends React.Component {
  componentDidMount() {
    // Disable for Chrome
    document.addEventListener('wheel', (event) => {
      if (event.toElement) {
        if (event.toElement.nodeName === 'CANVAS') {
          event.preventDefault();
        }
      }
    }, { passive: false });

    // Disable for Safari
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
  }

  render() {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <WrappedComponent {...this.props} />
    );
  }
};

export default preventZoom;
