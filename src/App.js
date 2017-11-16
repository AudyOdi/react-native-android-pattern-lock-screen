// @flow

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  Dimensions,
  Alert
} from 'react-native';
import {Svg} from 'expo';
const {Line, Circle} = Svg;

const {width, height} = Dimensions.get('window');

let svgContainerHeight = height / 2;
let svgContainerWidth = width;

const HITSLOP = 15;

type Coordinate = {
  x: number,
  y: number
};

type LineCoordinate = {
  startX: number,
  startY: number,
  endX: number,
  endY: number
};

type State = {
  activeDotCoordinate: ?Coordinate,
  initialGestureCoordinate: ?Coordinate,
  fixedLine: Array<LineCoordinate>,
  pattern: Array<Coordinate>
};

export default class App extends React.Component<void, State> {
  panResponder: Object;
  panAnimation: Animated.ValueXY;
  _lineComponent: ?Object;
  _dotsComponent: Array<?Object>;
  _dots: Array<Coordinate>;
  _mappedDotsIndex: Array<Coordinate>;
  _animatedIndexes: Array<number>;

  animatedValue: Animated.Value;
  patternIndexes: Array<number>;

  constructor() {
    super(...arguments);
    this.state = {
      initialGestureCoordinate: null,
      activeDotCoordinate: null,
      fixedLine: [],
      pattern: []
    };

    this._dots = this._setInitialDots();
    this._dotsComponent = [];
    this.patternIndexes = [];

    this.animatedValue = new Animated.Value(5);
    this.animatedValue.addListener(({value}) => {
      this._animatedIndexes.forEach(index => {
        let dot = this._dotsComponent[index];
        dot && dot.setNativeProps({r: value.toString()});
      });
    });

    this.panAnimation = new Animated.ValueXY({x: 0, y: 0});

    this.panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: e => {
        let {locationX, locationY} = e.nativeEvent;
        this.panAnimation.setOffset({x: 0, y: 0});
        this.panAnimation.setValue({x: 0, y: 0});

        let activeDotCoordinate = this._getDotCoordinate({
          x: locationX,
          y: locationY
        });

        if (activeDotCoordinate) {
          this.setState({
            activeDotCoordinate,
            initialGestureCoordinate: activeDotCoordinate,
            pattern: [activeDotCoordinate]
          });
        }
      },
      onPanResponderMove: (e, gestureState) => {
        let {dx, dy, x0, y0} = gestureState;
        let {
          initialGestureCoordinate,
          activeDotCoordinate,
          fixedLine,
          pattern
        } = this.state;

        if (activeDotCoordinate == null || initialGestureCoordinate == null) {
          return;
        }

        let endLineX = initialGestureCoordinate.x + dx;
        let endLineY = initialGestureCoordinate.y + dy;

        let hitDotCoordinate = this._getDotCoordinate({
          x: endLineX,
          y: endLineY
        });

        if (hitDotCoordinate && !this._dotGetPassed(hitDotCoordinate)) {
          fixedLine.push({
            startX: activeDotCoordinate.x,
            startY: activeDotCoordinate.y,
            endX: hitDotCoordinate.x,
            endY: hitDotCoordinate.y
          });
          let additionalPassedDots = [];
          if (pattern.length > 0) {
            additionalPassedDots = this._getAdditionalPassedDots(
              pattern[pattern.length - 1],
              {x: hitDotCoordinate.x, y: hitDotCoordinate.y}
            );
          }

          additionalPassedDots.forEach(dot => {
            pattern.push({x: dot.x, y: dot.y});
          });

          let lastestCoordinate = {
            x: hitDotCoordinate.x,
            y: hitDotCoordinate.y
          };

          pattern.push(lastestCoordinate);

          this._animatedIndexes = [
            ...additionalPassedDots,
            lastestCoordinate
          ].map(newDot => {
            return this._dots.findIndex(
              dot => dot.x === newDot.x && dot.y === newDot.y
            );
          });

          this.setState(
            {
              pattern,
              fixedLine,
              activeDotCoordinate: {
                x: hitDotCoordinate.x,
                y: hitDotCoordinate.y
              }
            },
            () => {
              Animated.timing(this.animatedValue, {
                toValue: 10,
                duration: 100
              }).start(() => {
                Animated.timing(this.animatedValue, {
                  toValue: 5,
                  duration: 100
                }).start();
              });
            }
          );
        } else {
          this._lineComponent &&
            this._lineComponent.setNativeProps({
              x2: endLineX.toString(),
              y2: endLineY.toString()
            });
        }
      },
      onPanResponderRelease: () => {
        // Alert.alert(
        //   this.state.pattern.map(path => JSON.stringify(path)).join(' ')
        // );

        let {pattern} = this.state;
        this.patternIndexes = pattern.map(newDot => {
          return this._dots.findIndex(
            dot => dot.x === newDot.x && dot.y === newDot.y
          );
        });
        this.setState(
          {
            initialGestureCoordinate: null,
            activeDotCoordinate: null
          },
          () => {
            setTimeout(() => {
              this.patternIndexes = [];
              this.setState({
                fixedLine: [],
                pattern: []
              });
            }, 2500);
          }
        );
      }
    });
  }

  render() {
    let {
      initialGestureCoordinate,
      activeDotCoordinate,
      fixedLine,
      pattern
    } = this.state;
    return (
      <View style={styles.container}>
        <Animated.View {...this.panResponder.panHandlers}>
          <Svg height={svgContainerHeight} width={svgContainerWidth}>
            {this._dots.map((dot, i) => {
              return (
                <Circle
                  ref={circle => (this._dotsComponent[i] = circle)}
                  key={i}
                  cx={dot.x}
                  cy={dot.y}
                  r="5"
                  fill={(this.patternIndexes.includes(i) && 'blue') || 'red'}
                />
              );
            })}
            {fixedLine.map((coordinate, index) => {
              let {startX, startY, endX, endY} = coordinate;
              return (
                <Line
                  key={`fixedLine${index}`}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={(!activeDotCoordinate && 'blue') || 'red'}
                  strokeWidth="2"
                />
              );
            })}
            {activeDotCoordinate ? (
              <Line
                ref={component => (this._lineComponent = component)}
                x1={activeDotCoordinate.x}
                y1={activeDotCoordinate.y}
                x2={activeDotCoordinate.x}
                y2={activeDotCoordinate.y}
                stroke="red"
                strokeWidth="2"
              />
            ) : null}
          </Svg>
        </Animated.View>
      </View>
    );
  }

  _setInitialDots() {
    let row1 = {indexes: [], dots: []};
    let row2 = {indexes: [], dots: []};
    let row3 = {indexes: [], dots: []};
    for (let i = 0; i < 3; i++) {
      let offsetX = 0;
      if (i > 0) {
        offsetX = svgContainerWidth / 3 * i;
      }
      row1.dots.push({
        x: offsetX + svgContainerWidth / 3 / 2,
        y: svgContainerWidth / 3 / 2
      });
      row1.indexes.push({x: i, y: 0});
    }
    for (let i = 0; i < 3; i++) {
      let offsetX = 0;
      let offsetY = svgContainerHeight / 3;
      if (i > 0) {
        offsetX = svgContainerWidth / 3 * i;
      }
      row2.dots.push({
        x: offsetX + svgContainerWidth / 3 / 2,
        y: offsetY + svgContainerWidth / 3 / 2
      });
      row2.indexes.push({x: i, y: 1});
    }
    for (let i = 0; i < 3; i++) {
      let offsetX = 0;
      let offsetY = svgContainerHeight / 3 * 2;
      if (i > 0) {
        offsetX = svgContainerWidth / 3 * i;
      }
      row3.dots.push({
        x: offsetX + svgContainerWidth / 3 / 2,
        y: offsetY + svgContainerWidth / 3 / 2
      });
      row3.indexes.push({x: i, y: 2});
    }

    this._mappedDotsIndex = [...row1.indexes, ...row2.indexes, ...row3.indexes];

    return [...row1.dots, ...row2.dots, ...row3.dots];
  }
  _getDotCoordinate({x, y}: Coordinate) {
    let coordinate;
    for (let i = 0; i < this._dots.length; i++) {
      let {x: dotX, y: dotY} = this._dots[i];
      if (
        dotX + HITSLOP >= x &&
        dotX - HITSLOP <= x &&
        (dotY + HITSLOP >= y && dotY - HITSLOP <= y)
      ) {
        coordinate = {x: dotX, y: dotY};
        break;
      }
    }
    return coordinate;
  }

  _dotGetPassed({x, y}: Coordinate) {
    let {pattern} = this.state;
    return pattern.find(dot => {
      return dot.x === x && dot.y === y;
    }) == null
      ? false
      : true;
  }

  _getAdditionalPassedDots(
    lastPassedCoordinate: Coordinate,
    newPassedCoordinate: Coordinate
  ) {
    let newPassedIndex = this._dots.findIndex(
      dot => newPassedCoordinate.x === dot.x && newPassedCoordinate.y === dot.y
    );
    let lastPassedIndex = this._dots.findIndex(
      dot =>
        lastPassedCoordinate.x === dot.x && lastPassedCoordinate.y === dot.y
    );
    if (newPassedIndex == null || lastPassedIndex == null) {
      return [];
    }
    let mappedLastDotIndex = this._mappedDotsIndex[lastPassedIndex];
    let mappedNewDotIndex = this._mappedDotsIndex[newPassedIndex];

    let additionalPassedDots = [];
    let testIndex = [];
    // check horizontal
    if (mappedNewDotIndex.y === mappedLastDotIndex.y) {
      for (
        let i = Math.min(mappedNewDotIndex.x, mappedLastDotIndex.x) + 1;
        i < Math.max(mappedNewDotIndex.x, mappedLastDotIndex.x);
        i++
      ) {
        let index = this._mappedDotsIndex.findIndex(
          dot => dot.x === i && dot.y === mappedNewDotIndex.y
        );
        if (index > -1) {
          additionalPassedDots.push(this._dots[index]);
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
        let index = this._mappedDotsIndex.findIndex(
          dot => dot.x === mappedLastDotIndex.x && dot.y === i
        );
        if (index > -1) {
          additionalPassedDots.push(this._dots[index]);
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
        let index = this._mappedDotsIndex.findIndex(
          dot => dot.x === i && dot.y === i
        );
        if (index > -1) {
          additionalPassedDots.push(this._dots[index]);
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
        let index = this._mappedDotsIndex.findIndex(
          dot => dot.x === i && dot.y === i
        );
        if (index > -1) {
          additionalPassedDots.push(this._dots[index]);
        }
      }
    }
    return additionalPassedDots;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
