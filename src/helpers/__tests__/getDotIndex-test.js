import getDotIndex from '../getDotIndex';

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

describe('getDotIndex', () => {
  it('should return passed dot according to gesture coordinate with default hit slop', () => {
    let passedDotIndex = getDotIndex({x: 65, y: 65}, dots);
    expect(dots[passedDotIndex]).toEqual({x: 65, y: 65});

    passedDotIndex = getDotIndex({x: 80, y: 65}, dots);
    expect(dots[passedDotIndex]).toEqual({x: 65, y: 65});

    passedDotIndex = getDotIndex({x: 140, y: 120}, dots);
    expect(dots[passedDotIndex]).toEqual({x: 130, y: 130});
  });

  it('should return passed dot according to gesture coordinate with custom hit slop', () => {
    let passedDotIndex = getDotIndex({x: 55, y: 55}, dots, 5);
    expect(passedDotIndex).not.toBeDefined();

    passedDotIndex = getDotIndex({x: 70, y: 80}, dots, 5);
    expect(passedDotIndex).not.toBeDefined();

    passedDotIndex = getDotIndex({x: 200, y: 160}, dots, 25);
    expect(dots[passedDotIndex]).toEqual({x: 185, y: 185});
  });
});
