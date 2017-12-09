// @flow

export default function populateDotsCoordinate(
  dotsDimension: number,
  containerWidth: number,
  containerHeight: number
) {
  let mappedIndex = [];
  let screenCoordinates = [];

  for (let rowIndex = 0; rowIndex < dotsDimension; rowIndex++) {
    for (let columnIndex = 0; columnIndex < dotsDimension; columnIndex++) {
      let offsetX = containerWidth / dotsDimension * columnIndex;
      let offsetY = containerHeight / dotsDimension * rowIndex;

      screenCoordinates.push({
        x: offsetX + containerWidth / dotsDimension / 2,
        y: offsetY + containerWidth / dotsDimension / 2
      });
      mappedIndex.push({x: columnIndex, y: rowIndex});
    }
  }

  return {
    mappedIndex,
    screenCoordinates
  };
}
