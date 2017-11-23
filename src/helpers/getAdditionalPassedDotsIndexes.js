// @flow

type Coordinate = {x: number, y: number};

export default function getAdditionalPassedDotsIndexes(
  lastPassedCoordinate: Coordinate,
  newPassedCoordinate: Coordinate,
  dots: Array<Coordinate>
) {
  let additionalPassedDotIndexes = [];
  let testIndex = [];

  // check horizontal
  if (newPassedCoordinate.y === lastPassedCoordinate.y) {
    for (
      let i = Math.min(newPassedCoordinate.x, lastPassedCoordinate.x) + 1;
      i < Math.max(newPassedCoordinate.x, lastPassedCoordinate.x);
      i++
    ) {
      let index = dots.findIndex(
        dot => dot.x === i && dot.y === newPassedCoordinate.y
      );
      if (index > -1) {
        additionalPassedDotIndexes.push(index);
      }
    }
  }

  // check vertical
  if (newPassedCoordinate.x === lastPassedCoordinate.x) {
    for (
      let i = Math.min(newPassedCoordinate.y, lastPassedCoordinate.y) + 1;
      i < Math.max(newPassedCoordinate.y, lastPassedCoordinate.y);
      i++
    ) {
      let index = dots.findIndex(
        dot => dot.x === lastPassedCoordinate.x && dot.y === i
      );
      if (index > -1) {
        additionalPassedDotIndexes.push(index);
      }
    }
  }

  // check diagonal from top left to bottom right
  if (
    newPassedCoordinate.x === newPassedCoordinate.y &&
    lastPassedCoordinate.x === lastPassedCoordinate.y
  ) {
    for (
      let i = Math.min(newPassedCoordinate.y, lastPassedCoordinate.y) + 1;
      i < Math.max(newPassedCoordinate.y, lastPassedCoordinate.y);
      i++
    ) {
      let index = dots.findIndex(dot => dot.x === i && dot.y === i);
      if (index > -1) {
        additionalPassedDotIndexes.push(index);
      }
    }
  }

  // check diagonal from bottom left to top right
  if (
    newPassedCoordinate.x === lastPassedCoordinate.y &&
    newPassedCoordinate.y === lastPassedCoordinate.x
  ) {
    for (
      let i = Math.min(newPassedCoordinate.y, lastPassedCoordinate.y) + 1;
      i < Math.max(newPassedCoordinate.y, lastPassedCoordinate.y);
      i++
    ) {
      let index = dots.findIndex(dot => dot.x === i && dot.y === i);
      if (index > -1) {
        additionalPassedDotIndexes.push(index);
      }
    }
  }
  return additionalPassedDotIndexes;
}
