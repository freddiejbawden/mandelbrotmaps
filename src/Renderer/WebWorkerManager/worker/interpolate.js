const interpolate = (start, end, t) => {
  if (t <= 0) {
    return 255;
  }
  if (t >= 1) {
    return end;
  }
  return (end - start) * t + start;
};

export default interpolate;
