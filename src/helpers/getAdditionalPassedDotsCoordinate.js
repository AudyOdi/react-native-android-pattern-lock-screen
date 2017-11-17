// @flow

type Coordinate = {x: number, y: number};

export default function getAdditionalPassedDotsCoordinate(
  lastPassedCoordinate: Coordinate,
  newPassedCoordinate: Coordinate,
  dots: Array<Coordinate>,
  mappedDotsIndex: Array<Coordinate>
) {
  let newPassedIndex = dots.findIndex(
    dot => newPassedCoordinate.x === dot.x && newPassedCoordinate.y === dot.y
  );
  let lastPassedIndex = dots.findIndex(
    dot => lastPassedCoordinate.x === dot.x && lastPassedCoordinate.y === dot.y
  );
  if (newPassedIndex == null || lastPassedIndex == null) {
    return [];
  }
  let mappedLastDotIndex = mappedDotsIndex[lastPassedIndex];
  let mappedNewDotIndex = mappedDotsIndex[newPassedIndex];

  let additionalPassedDots = [];
  let testIndex = [];
  // check horizontal
  if (mappedNewDotIndex.y === mappedLastDotIndex.y) {
    for (
      let i = Math.min(mappedNewDotIndex.x, mappedLastDotIndex.x) + 1;
      i < Math.max(mappedNewDotIndex.x, mappedLastDotIndex.x);
      i++
    ) {
      let index = mappedDotsIndex.findIndex(
        dot => dot.x === i && dot.y === mappedNewDotIndex.y
      );
      if (index > -1) {
        additionalPassedDots.push(dots[index]);
      }
    }
  }

  // check vertical
  if (mappedNewDotIndex.x === mappedLastDotIndex.x) {
    for (
      let i = Math.min(mappedNewDotIndex.y, mappedLastDotIndex.y) + 1;
      i < Math.max(mappedNewDotIndex.y, mappedLastDotIndex.y);
      i++
    ) {
      let index = mappedDotsIndex.findIndex(
        dot => dot.x === mappedLastDotIndex.x && dot.y === i
      );
      if (index > -1) {
        additionalPassedDots.push(dots[index]);
      }
    }
  }

  // check diagonal from top left to bottom right

  if (
    mappedNewDotIndex.x === mappedNewDotIndex.y &&
    mappedLastDotIndex.x === mappedLastDotIndex.y
  ) {
    for (
      let i = Math.min(mappedNewDotIndex.y, mappedLastDotIndex.y) + 1;
      i < Math.max(mappedNewDotIndex.y, mappedLastDotIndex.y);
      i++
    ) {
      let index = mappedDotsIndex.findIndex(dot => dot.x === i && dot.y === i);
      if (index > -1) {
        additionalPassedDots.push(dots[index]);
      }
    }
  }

  // check diagonal from bottom left to top right

  if (
    mappedNewDotIndex.x === mappedLastDotIndex.y &&
    mappedNewDotIndex.y === mappedLastDotIndex.x
  ) {
    for (
      let i = Math.min(mappedNewDotIndex.y, mappedLastDotIndex.y) + 1;
      i < Math.max(mappedNewDotIndex.y, mappedLastDotIndex.y);
      i++
    ) {
      let index = mappedDotsIndex.findIndex(dot => dot.x === i && dot.y === i);
      if (index > -1) {
        additionalPassedDots.push(dots[index]);
      }
    }
  }
  return additionalPassedDots;
}
