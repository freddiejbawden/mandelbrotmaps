const distance = (touch1, touch2) => {
  const sqSum = (touch1.fractalX - touch2.fractalX) ** 2 + (touch1.fractalY - touch2.fractalY) ** 2;
  return Math.sqrt(sqSum);
};

const centre = (touch1, touch2) => ({
  x: (touch1.fractalX + touch2.fractalY) / 2,
  y: (touch1.fractalX + touch2.fractalY) / 2,
});

export { centre };
export default distance;
