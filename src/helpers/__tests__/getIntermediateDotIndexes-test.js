import getIntermediateDotIndexes from '../getIntermediateDotIndexes';

const dimension = 3;
const dots = [
  {x: 0, y: 0},
  {x: 1, y: 0},
  {x: 2, y: 0},
  {x: 0, y: 1},
  {x: 1, y: 1},
  {x: 2, y: 1},
  {x: 0, y: 2},
  {x: 1, y: 2},
  {x: 2, y: 2}
];

describe('getIntermediateDotIndexes', () => {
  it('should return empty array if no intermediate dots', () => {
    let additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 0, y: 0},
      {x: 1, y: 2},
      dimension
    );
    expect(additionalDotsIndexes).toEqual([]);
  });

  it('should return intermediate dots on a horizontal line', () => {
    let additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 0, y: 0},
      {x: 2, y: 0},
      dimension
    );
    let coordinates = additionalDotsIndexes.map(index => dots[index]);
    expect(coordinates).toEqual([{x: 1, y: 0}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 2, y: 0},
      {x: 0, y: 0},
      dimension
    );
    coordinates = additionalDotsIndexes.map(index => dots[index]);
    expect(coordinates).toEqual([{x: 1, y: 0}]);
  });

  it('should return intermediate dots on a vertical line', () => {
    let additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 0, y: 0},
      {x: 0, y: 2},
      dimension
    );
    let coordinates = additionalDotsIndexes.map(index => dots[index]);
    expect(coordinates).toEqual([{x: 0, y: 1}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 0, y: 2},
      {x: 0, y: 0},
      dimension
    );
    coordinates = additionalDotsIndexes.map(index => dots[index]);
    expect(coordinates).toEqual([{x: 0, y: 1}]);
  });

  it('should return intermediate dots diagonally', () => {
    let additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 0, y: 0},
      {x: 2, y: 2},
      dimension
    );
    let coordinates = additionalDotsIndexes.map(index => dots[index]);
    expect(coordinates).toEqual([{x: 1, y: 1}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 0, y: 2},
      {x: 2, y: 0},
      dimension
    );
    coordinates = additionalDotsIndexes.map(index => dots[index]);
    expect(coordinates).toEqual([{x: 1, y: 1}]);
  });

  it('should not affect the logic even if the dot dimension change', () => {
    let customDimension = 5;
    const customDots = [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 3, y: 0},
      {x: 4, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 1},
      {x: 2, y: 1},
      {x: 3, y: 1},
      {x: 4, y: 1},
      {x: 0, y: 2},
      {x: 1, y: 2},
      {x: 2, y: 2},
      {x: 3, y: 2},
      {x: 4, y: 2},
      {x: 0, y: 3},
      {x: 1, y: 3},
      {x: 2, y: 3},
      {x: 3, y: 3},
      {x: 4, y: 3},
      {x: 0, y: 4},
      {x: 1, y: 4},
      {x: 2, y: 4},
      {x: 3, y: 4},
      {x: 4, y: 4}
    ];

    let additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 1, y: 0},
      {x: 4, y: 0},
      customDimension
    );
    let coordinates = additionalDotsIndexes.map(index => customDots[index]);
    expect(coordinates).toEqual([{x: 2, y: 0}, {x: 3, y: 0}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 2, y: 1},
      {x: 2, y: 4},
      customDimension
    );
    coordinates = additionalDotsIndexes.map(index => customDots[index]);
    expect(coordinates).toEqual([{x: 2, y: 2}, {x: 2, y: 3}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 2, y: 2},
      {x: 4, y: 4},
      customDimension
    );
    coordinates = additionalDotsIndexes.map(index => customDots[index]);
    expect(coordinates).toEqual([{x: 3, y: 3}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 0, y: 1},
      {x: 3, y: 4},
      customDimension
    );
    coordinates = additionalDotsIndexes.map(index => customDots[index]);
    expect(coordinates).toEqual([{x: 1, y: 2}, {x: 2, y: 3}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 4, y: 3},
      {x: 1, y: 0},
      customDimension
    );
    coordinates = additionalDotsIndexes.map(index => customDots[index]);
    expect(coordinates).toEqual([{x: 2, y: 1}, {x: 3, y: 2}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 1, y: 4},
      {x: 4, y: 1},
      customDimension
    );
    coordinates = additionalDotsIndexes.map(index => customDots[index]);
    expect(coordinates).toEqual([{x: 3, y: 2}, {x: 2, y: 3}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 3, y: 0},
      {x: 0, y: 3},
      customDimension
    );
    coordinates = additionalDotsIndexes.map(index => customDots[index]);
    expect(coordinates).toEqual([{x: 2, y: 1}, {x: 1, y: 2}]);

    additionalDotsIndexes = getIntermediateDotIndexes(
      {x: 0, y: 3},
      {x: 3, y: 0},
      customDimension
    );
    coordinates = additionalDotsIndexes.map(index => customDots[index]);
    expect(coordinates).toEqual([{x: 2, y: 1}, {x: 1, y: 2}]);
  });
});
