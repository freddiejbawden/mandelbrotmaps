import Rectangle from '../../utils/Rectangle';

let rect1;
beforeEach(async () => {
  rect1 = new Rectangle(0,0,10,10);
})
test('point in bounds normal', () => {
  const res = rect1.pointInBounds(5,5);
  expect(res).toEqual(true);
})
test('point on bound', () => {
  expect(rect1.pointInBounds(0,5)).toEqual(true);
  expect(rect1.pointInBounds(5,0)).toEqual(true);
  expect(rect1.pointInBounds(10,5)).toEqual(true);
  expect(rect1.pointInBounds(5,10)).toEqual(true);
})
test('point not in bounds', () => {
  expect(rect1.pointInBounds(11,11)).toEqual(false);
  expect(rect1.pointInBounds(-1,-1)).toEqual(false);
  expect(rect1.pointInBounds(5,11)).toEqual(false);
  expect(rect1.pointInBounds(11,5)).toEqual(false);
  expect(rect1.pointInBounds(-1,5)).toEqual(false);
  expect(rect1.pointInBounds(5,-1)).toEqual(false);
})
test('point not in bounds', () => {
  expect(rect1.pointInBounds(11,11)).toEqual(false);
  expect(rect1.pointInBounds(-1,-1)).toEqual(false);
  expect(rect1.pointInBounds(5,11)).toEqual(false);
  expect(rect1.pointInBounds(11,5)).toEqual(false);
  expect(rect1.pointInBounds(-1,5)).toEqual(false);
  expect(rect1.pointInBounds(5,-1)).toEqual(false);
})
test('rectangle overlap if inside', () => {
  const rectA = new Rectangle(1,1,9,9);
  expect(rect1.overlap(rectA)).toEqual(true);
})
test('rectangle top left corner overlap', () => {
  const rectA = new Rectangle(5,5,15,15);
  expect(rect1.overlap(rectA)).toEqual(true);
})
test('rectangle top right corner overlap', () => {
  const rectA = new Rectangle(-5,5,10,10);
  expect(rect1.overlap(rectA)).toEqual(true);
})
test('rectangle bottom left corner overlap', () => {
  const rectA = new Rectangle(-5,-5,10,10);
  expect(rect1.overlap(rectA)).toEqual(true);
})
test('rectangle bottom left corner overlap', () => {
  const rectA = new Rectangle(5,-5,10,10);
  expect(rect1.overlap(rectA)).toEqual(true);
})
test('rectangle outside other', () => {
  const rectA = new Rectangle(15,15,10,10);
  expect(rect1.overlap(rectA)).toEqual(false);
  const rectB = new Rectangle(-15,-15,10,10);
  expect(rect1.overlap(rectB)).toEqual(false);
})