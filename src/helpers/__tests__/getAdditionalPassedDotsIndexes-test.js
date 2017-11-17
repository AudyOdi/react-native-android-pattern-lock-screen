import getAdditionalPassedDotsIndexes from '../getAdditionalPassedDotsIndexes';

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

describe('getAdditionalPassedDotsIndexes', () => {
  it('should return empty array if active gesture coordinate is passing any dots', () => {
    let pattern = [{x: 0, y: 0}];
    let additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 1, y: 2},
      dots
    );
    expect(additionalDotsIndexes.length).toBe(0);
  });

  it('should return dots that get passed horrizontally', () => {
    let pattern = [{x: 0, y: 0}];
    let additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 2, y: 0},
      dots
    );
    expect(additionalDotsIndexes.length).toBe(1);
    expect(dots[additionalDotsIndexes[0]]).toEqual({x: 1, y: 0});

    pattern = [{x: 2, y: 0}];
    additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 0, y: 0},
      dots
    );
    expect(additionalDotsIndexes.length).toBe(1);
    expect(dots[additionalDotsIndexes[0]]).toEqual({x: 1, y: 0});
  });

  it('should return dots that get passed vertically', () => {
    let pattern = [{x: 0, y: 0}];
    let additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 0, y: 2},
      dots
    );
    expect(additionalDotsIndexes.length).toBe(1);
    expect(dots[additionalDotsIndexes[0]]).toEqual({x: 0, y: 1});

    pattern = [{x: 0, y: 2}];
    additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 0, y: 0},
      dots
    );
    expect(additionalDotsIndexes.length).toBe(1);
    expect(dots[additionalDotsIndexes[0]]).toEqual({x: 0, y: 1});
  });

  it('should return dots that get passed diagonally', () => {
    let pattern = [{x: 0, y: 0}];
    let additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 2, y: 2},
      dots
    );
    expect(additionalDotsIndexes.length).toBe(1);
    expect(dots[additionalDotsIndexes[0]]).toEqual({x: 1, y: 1});

    pattern = [{x: 0, y: 2}];
    additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 2, y: 0},
      dots
    );
    expect(additionalDotsIndexes.length).toBe(1);
    expect(dots[additionalDotsIndexes[0]]).toEqual({x: 1, y: 1});
  });

  it('should not affect the logic even if the dot dimension change', () => {
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

    let pattern = [{x: 1, y: 0}];
    let additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 4, y: 0},
      customDots
    );
    expect(additionalDotsIndexes.length).toBe(2);
    expect(customDots[additionalDotsIndexes[0]]).toEqual({x: 2, y: 0});
    expect(customDots[additionalDotsIndexes[1]]).toEqual({x: 3, y: 0});

    pattern = [{x: 2, y: 1}];
    additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 2, y: 4},
      customDots
    );
    expect(additionalDotsIndexes.length).toBe(2);
    expect(customDots[additionalDotsIndexes[0]]).toEqual({x: 2, y: 2});
    expect(customDots[additionalDotsIndexes[1]]).toEqual({x: 2, y: 3});

    pattern = [{x: 2, y: 2}];
    additionalDotsIndexes = getAdditionalPassedDotsIndexes(
      pattern[0],
      {x: 4, y: 4},
      customDots
    );
    expect(additionalDotsIndexes.length).toBe(1);
    expect(customDots[additionalDotsIndexes[0]]).toEqual({x: 3, y: 3});
  });
});
