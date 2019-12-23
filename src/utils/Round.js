const round = (value, decimal) => (
  (Math.round(value * 10 ** decimal)) / 10 ** decimal
);

export default round;
