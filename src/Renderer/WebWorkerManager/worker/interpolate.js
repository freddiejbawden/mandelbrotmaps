const interpolate = (start, end, t) => {
  if (t < 0) {
    return 0;
  }
  return (end - start) * t + start;
};

export default interpolate;
