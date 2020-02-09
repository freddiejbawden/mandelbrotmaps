const interpolate = (start, end, t) => {
  if (t < 0) {
    return 255;
  }
  return (end - start) * t + start;
};

export default interpolate;
