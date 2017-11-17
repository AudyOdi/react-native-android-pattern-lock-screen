// @flow

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import {Svg} from 'expo';

import {
  populateDotsCoordinate,
  getPassedDots,
  getAdditionalPassedDotsCoordinate
} from './helpers';

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

const {Line, Circle} = Svg;
const HITSLOP = 15;
const DOTS_DIMENSION = 3;
const {width, height} = Dimensions.get('window');

const svgContainerHeight = height / 2;
const svgContainerWidth = width;

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

    let {actualDotsCoordinate, mappedDotsIndex} = populateDotsCoordinate(
      DOTS_DIMENSION,
      svgContainerWidth,
      svgContainerHeight
    );
    this._dots = actualDotsCoordinate;
    this._mappedDotsIndex = mappedDotsIndex;
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

        let activeDotCoordinate = getPassedDots(
          {x: locationX, y: locationY},
          this._dots
        );

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

        let hitDotCoordinate = getPassedDots(
          {x: endLineX, y: endLineY},
          this._dots
        );

        if (hitDotCoordinate && !this._hasDotGetPassed(hitDotCoordinate)) {
          fixedLine.push({
            startX: activeDotCoordinate.x,
            startY: activeDotCoordinate.y,
            endX: hitDotCoordinate.x,
            endY: hitDotCoordinate.y
          });
          let additionalPassedDots = [];
          if (pattern.length > 0) {
            additionalPassedDots = getAdditionalPassedDotsCoordinate(
              pattern[pattern.length - 1],
              {x: hitDotCoordinate.x, y: hitDotCoordinate.y},
              this._dots,
              this._mappedDotsIndex
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

  _hasDotGetPassed({x, y}: Coordinate) {
    let {pattern} = this.state;
    return pattern.find(dot => {
      return dot.x === x && dot.y === y;
    }) == null
      ? false
      : true;
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
