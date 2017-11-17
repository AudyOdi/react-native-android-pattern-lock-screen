// @flow

type Coordinate = {x: number, y: number};

const DEFAULT_HIT_SLOP = 15;

export default function getPassedDots(
  gestureCoordinate: Coordinate,
  dots: Array<Coordinate>,
  hitSlop?: number = DEFAULT_HIT_SLOP
) {
  let coordinate;
  let {x, y} = gestureCoordinate;
  for (let i = 0; i < dots.length; i++) {
    let {x: dotX, y: dotY} = dots[i];
    if (
      dotX + hitSlop >= x &&
      dotX - hitSlop <= x &&
      (dotY + hitSlop >= y && dotY - hitSlop <= y)
    ) {
      coordinate = {x: dotX, y: dotY};
      break;
    }
  }
  return coordinate;
}
