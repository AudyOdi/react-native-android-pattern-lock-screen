// @flow

type Coordinate = {x: number, y: number};

export default function getIntermediateDotIndexes(
  anchorCoordinate: Coordinate,
  focusCoordinate: Coordinate,
  dimension: number
) {
  let intermediateDotIndexes = [];
  let testIndex = [];

  // check horizontal
  if (focusCoordinate.y === anchorCoordinate.y) {
    let row = focusCoordinate.y;
    for (
      let col = Math.min(focusCoordinate.x, anchorCoordinate.x) + 1;
      col < Math.max(focusCoordinate.x, anchorCoordinate.x);
      col++
    ) {
      let index = row * dimension + col;
      intermediateDotIndexes.push(index);
    }
  }

  // check vertical
  if (focusCoordinate.x === anchorCoordinate.x) {
    let col = anchorCoordinate.x;
    for (
      let row = Math.min(focusCoordinate.y, anchorCoordinate.y) + 1;
      row < Math.max(focusCoordinate.y, anchorCoordinate.y);
      row++
    ) {
      let index = row * dimension + col;
      intermediateDotIndexes.push(index);
    }
  }

  // check diagonal
  let dx = focusCoordinate.x - anchorCoordinate.x;
  let dy = focusCoordinate.y - anchorCoordinate.y;
  if (Math.abs(dx) === Math.abs(dy)) {
    let loopCount = 1;

    let getCalculatedCol = (iterator: number) => {
      if (dx === dy) {
        // diagonal from top left to bottom right or vice versa
        let col = Math.min(focusCoordinate.x, anchorCoordinate.x);
        return col + iterator;
      } else {
        // diagonal from top right to bottom left or vice versa
        let col = Math.max(focusCoordinate.x, anchorCoordinate.x);
        return col - iterator;
      }
    };

    for (
      let row = Math.min(focusCoordinate.y, anchorCoordinate.y) + 1;
      row < Math.max(focusCoordinate.y, anchorCoordinate.y);
      row++
    ) {
      let index = row * dimension + getCalculatedCol(loopCount);
      intermediateDotIndexes.push(index);
      loopCount++;
    }
  }

  return intermediateDotIndexes;
}
