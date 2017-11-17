import getPassedDotIndex from '../getPassedDotIndex';

const dots = [
  {x: 65, y: 65},
  {x: 130, y: 65},
  {x: 185, y: 65},
  {x: 65, y: 130},
  {x: 130, y: 130},
  {x: 185, y: 130},
  {x: 65, y: 185},
  {x: 130, y: 185},
  {x: 185, y: 185}
];

describe('getPassedDotIndex', () => {
  it('should return passed dot according to gesture coordinate with default hit slop', () => {
    let passedDotIndex = getPassedDotIndex({x: 65, y: 65}, dots);
    expect(dots[passedDotIndex]).toEqual({x: 65, y: 65});

    passedDotIndex = getPassedDotIndex({x: 80, y: 65}, dots);
    expect(dots[passedDotIndex]).toEqual({x: 65, y: 65});

    passedDotIndex = getPassedDotIndex({x: 140, y: 120}, dots);
    expect(dots[passedDotIndex]).toEqual({x: 130, y: 130});
  });

  it('should return passed dot according to gesture coordinate with custom hit slop', () => {
    let passedDotIndex = getPassedDotIndex({x: 55, y: 55}, dots, 5);
    expect(passedDotIndex).not.toBeDefined();

    passedDotIndex = getPassedDotIndex({x: 70, y: 80}, dots, 5);
    expect(passedDotIndex).not.toBeDefined();

    passedDotIndex = getPassedDotIndex({x: 200, y: 160}, dots, 25);
    expect(dots[passedDotIndex]).toEqual({x: 185, y: 185});
  });
});
