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
  getPassedDotIndex,
  getAdditionalPassedDotsIndexes
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
  pattern: Array<Coordinate>,
  animateIndexes: Array<number>
};

const {Line, Circle} = Svg;
const DOTS_DIMENSION = 3;
const DEFAULT_DOT_RADIUS = 5;
const SNAP_DOT_RADIUS = 10;
const SNAP_DURATION = 100;
const {width, height} = Dimensions.get('window');
const svgContainerHeight = height / 2;
const svgContainerWidth = width;

export default class PatternLockScreen extends React.Component<void, State> {
  _panResponder: {panHandlers: Object};
  _activeLineComponent: ?Object;
  _dots: Array<Coordinate>;
  _dotsComponent: Array<?Object>;
  _mappedDotsIndex: Array<Coordinate>;

  _snapAnimatedValue: Animated.Value;

  constructor() {
    super(...arguments);
    this.state = {
      initialGestureCoordinate: null,
      activeDotCoordinate: null,
      pattern: [],
      animateIndexes: []
    };

    let {actualDotsCoordinate, mappedDotsIndex} = populateDotsCoordinate(
      DOTS_DIMENSION,
      svgContainerWidth,
      svgContainerHeight
    );
    this._dots = actualDotsCoordinate;
    this._mappedDotsIndex = mappedDotsIndex;
    this._dotsComponent = [];

    this._snapAnimatedValue = new Animated.Value(DEFAULT_DOT_RADIUS);
    this._snapAnimatedValue.addListener(({value}) => {
      this.state.animateIndexes.forEach(index => {
        let dot = this._dotsComponent[index];
        dot && dot.setNativeProps({r: value.toString()});
      });
    });

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: e => {
        let {locationX, locationY} = e.nativeEvent;

        let activeDotIndex = getPassedDotIndex(
          {x: locationX, y: locationY},
          this._dots
        );

        if (activeDotIndex != null) {
          let activeDotCoordinate = this._dots[activeDotIndex];
          let firstDot = this._mappedDotsIndex[activeDotIndex];
          this.setState({
            activeDotCoordinate,
            initialGestureCoordinate: activeDotCoordinate,
            pattern: [firstDot]
          });
        }
      },
      onPanResponderMove: (e, gestureState) => {
        let {dx, dy, x0, y0} = gestureState;
        let {
          initialGestureCoordinate,
          activeDotCoordinate,
          pattern
        } = this.state;

        if (activeDotCoordinate == null || initialGestureCoordinate == null) {
          return;
        }

        let endGestureX = initialGestureCoordinate.x + dx;
        let endGestureY = initialGestureCoordinate.y + dy;

        let matchedDotIndex = getPassedDotIndex(
          {x: endGestureX, y: endGestureY},
          this._dots
        );

        let matchedDot =
          matchedDotIndex != null && this._mappedDotsIndex[matchedDotIndex];

        if (
          matchedDotIndex != null &&
          matchedDot &&
          !this._hasDotGetPassed(matchedDot)
        ) {
          let newPattern = {
            x: matchedDot.x,
            y: matchedDot.y
          };

          let additionalPassedDotIndexes = [];

          if (pattern.length > 0) {
            additionalPassedDotIndexes = getAdditionalPassedDotsIndexes(
              pattern[pattern.length - 1],
              newPattern,
              this._mappedDotsIndex
            );
          }

          let filteredAdditionalDots = additionalPassedDotIndexes.filter(
            index => !this._hasDotGetPassed(this._mappedDotsIndex[index])
          );

          filteredAdditionalDots.forEach(index => {
            let mappedDot = this._mappedDotsIndex[index];
            pattern.push({x: mappedDot.x, y: mappedDot.y});
          });

          pattern.push(newPattern);

          this.setState(
            {
              pattern,
              activeDotCoordinate: this._dots[matchedDotIndex],
              animateIndexes: [...filteredAdditionalDots, matchedDotIndex]
            },
            () => {
              Animated.timing(this._snapAnimatedValue, {
                toValue: SNAP_DOT_RADIUS,
                duration: SNAP_DURATION
              }).start(() => {
                Animated.timing(this._snapAnimatedValue, {
                  toValue: DEFAULT_DOT_RADIUS,
                  duration: SNAP_DURATION
                }).start();
              });
            }
          );
        } else {
          this._activeLineComponent &&
            this._activeLineComponent.setNativeProps({
              x2: endGestureX.toString(),
              y2: endGestureY.toString()
            });
        }
      },
      onPanResponderRelease: () => {
        this.setState({
          initialGestureCoordinate: null,
          activeDotCoordinate: null,
          animateIndexes: [],
          pattern: []
        });
      }
    });
  }

  render() {
    let {initialGestureCoordinate, activeDotCoordinate, pattern} = this.state;
    return (
      <View style={styles.container}>
        <Animated.View {...this._panResponder.panHandlers}>
          <Svg height={svgContainerHeight} width={svgContainerWidth}>
            {this._dots.map((dot, i) => {
              return (
                <Circle
                  ref={circle => (this._dotsComponent[i] = circle)}
                  key={i}
                  cx={dot.x}
                  cy={dot.y}
                  r={DEFAULT_DOT_RADIUS}
                  fill="red"
                />
              );
            })}
            {pattern.map((startCoordinate, index) => {
              if (index === pattern.length - 1) {
                return;
              }
              let startIndex = this._mappedDotsIndex.findIndex(dot => {
                return (
                  dot.x === startCoordinate.x && dot.y === startCoordinate.y
                );
              });
              let endCoordinate = pattern[index + 1];
              let endIndex = this._mappedDotsIndex.findIndex(dot => {
                return dot.x === endCoordinate.x && dot.y === endCoordinate.y;
              });

              if (startIndex < 0 || endIndex < 0) {
                return;
              }

              let actualStartDot = this._dots[startIndex];
              let actualEndDot = this._dots[endIndex];

              return (
                <Line
                  key={`fixedLine${index}`}
                  x1={actualStartDot.x}
                  y1={actualStartDot.y}
                  x2={actualEndDot.x}
                  y2={actualEndDot.y}
                  stroke={(!activeDotCoordinate && 'blue') || 'red'}
                  strokeWidth="2"
                />
              );
            })}
            {activeDotCoordinate ? (
              <Line
                ref={component => (this._activeLineComponent = component)}
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
