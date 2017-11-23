// @flow

export default function populateDotsCoordinate(
  dotsDimension: number,
  containerWidth: number,
  containerHeight: number
) {
  let mappedDotsIndex = [];
  let actualDotsCoordinate = [];

  for (let rowIndex = 0; rowIndex < dotsDimension; rowIndex++) {
    for (let columnIndex = 0; columnIndex < dotsDimension; columnIndex++) {
      let offsetX = containerWidth / dotsDimension * columnIndex;
      let offsetY = containerHeight / dotsDimension * rowIndex;

      actualDotsCoordinate.push({
        x: offsetX + containerWidth / dotsDimension / 2,
        y: offsetY + containerWidth / dotsDimension / 2
      });
      mappedDotsIndex.push({x: columnIndex, y: rowIndex});
    }
  }

  return {
    mappedDotsIndex,
    actualDotsCoordinate
  };
}
